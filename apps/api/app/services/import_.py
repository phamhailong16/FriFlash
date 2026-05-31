import io
import uuid
import re
from datetime import datetime, timezone
from typing import AsyncGenerator
import httpx
import openpyxl
import xlrd
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..db.models.deck import Deck
from ..db.models.word import Word, VariantGroup

MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB
MAX_ROWS = 5_000

# Expected column names (case-insensitive)
COL_HANZI = "hanzi"
COL_PINYIN = "pinyin"
COL_HAN_VIET = "han_viet"
COL_POS = "part_of_speech"
COL_MEANING = "meaning"
COL_NOTE = "note"

SHEETS_PATTERN = re.compile(
    r"docs\.google\.com/spreadsheets/d/([A-Za-z0-9_-]+)"
)


def _sheets_csv_url(url: str) -> str | None:
    m = SHEETS_PATTERN.search(url)
    if not m:
        return None
    sheet_id = m.group(1)
    return f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"


def _parse_rows_from_sheet(data: dict, rows: list[dict]) -> tuple[int, int]:
    """Returns (imported, skipped) counts — caller must flush session."""
    return len(rows), 0  # placeholder; real logic below


def _normalize_header(header: str) -> str:
    return header.strip().lower().replace(" ", "_")


def _rows_to_dicts(headers: list[str], rows: list[list]) -> list[dict]:
    normed = [_normalize_header(h) for h in headers]
    return [dict(zip(normed, row)) for row in rows]


def _read_xlsx(content: bytes) -> list[dict]:
    wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
    ws = wb.active
    rows_iter = ws.iter_rows(values_only=True)
    header_row = next(rows_iter, None)
    if not header_row:
        return []
    headers = [str(h) if h is not None else "" for h in header_row]
    rows = []
    for row in rows_iter:
        rows.append([str(c) if c is not None else "" for c in row])
    return _rows_to_dicts(headers, rows)


def _read_xls(content: bytes) -> list[dict]:
    wb = xlrd.open_workbook(file_contents=content)
    ws = wb.sheet_by_index(0)
    if ws.nrows < 1:
        return []
    headers = [str(ws.cell_value(0, c)) for c in range(ws.ncols)]
    rows = []
    for r in range(1, ws.nrows):
        rows.append([str(ws.cell_value(r, c)) for c in range(ws.ncols)])
    return _rows_to_dicts(headers, rows)


def _read_csv_text(text: str) -> list[dict]:
    import csv
    reader = csv.DictReader(io.StringIO(text))
    return [
        {_normalize_header(k): (v or "").strip() for k, v in row.items()}
        for row in reader
    ]


async def _bulk_insert(
    db: AsyncSession,
    deck: Deck,
    row_dicts: list[dict],
) -> tuple[int, int]:
    now = datetime.now(timezone.utc)
    imported = 0
    skipped = 0

    for row in row_dicts:
        hanzi = row.get(COL_HANZI, "").strip()
        if not hanzi:
            skipped += 1
            continue

        word = Word(
            id=str(uuid.uuid4()),
            deck_id=deck.id,
            hanzi=hanzi,
            note=row.get(COL_NOTE, "").strip() or None,
            known_count=0,
            unknown_count=0,
            created_at=now,
            updated_at=now,
        )
        db.add(word)

        vg = VariantGroup(
            id=str(uuid.uuid4()),
            word_id=word.id,
            pinyin=row.get(COL_PINYIN, "").strip() or None,
            han_viet=row.get(COL_HAN_VIET, "").strip() or None,
            part_of_speech=row.get(COL_POS, "").strip() or None,
            meaning=row.get(COL_MEANING, "").strip() or None,
            sort_order=0,
        )
        db.add(vg)
        imported += 1

    if imported:
        deck.card_count += imported
        deck.updated_at = now

    await db.commit()
    return imported, skipped


async def import_excel(
    db: AsyncSession,
    deck: Deck,
    content: bytes,
    filename: str,
) -> tuple[int, int]:
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext == "xlsx":
        rows = _read_xlsx(content)
    else:
        rows = _read_xls(content)

    rows = rows[:MAX_ROWS]
    return await _bulk_insert(db, deck, rows)


async def import_sheets(
    db: AsyncSession,
    deck: Deck,
    url: str,
) -> tuple[int, int]:
    csv_url = _sheets_csv_url(url)
    if not csv_url:
        raise ValueError("ERR-I001")

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        resp = await client.get(csv_url)

    if resp.status_code == 401 or resp.status_code == 403:
        raise ValueError("ERR-I002")
    if resp.status_code != 200:
        raise ValueError("ERR-I001")

    rows = _read_csv_text(resp.text)
    rows = rows[:MAX_ROWS]
    return await _bulk_insert(db, deck, rows)
