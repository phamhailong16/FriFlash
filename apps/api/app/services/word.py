import math
import uuid
from datetime import datetime, timezone
import httpx
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from ..db.models.deck import Deck
from ..db.models.word import Word, VariantGroup
from ..schemas.word import WordCreate, WordUpdate


async def list_words(
    db: AsyncSession,
    deck_id: str,
    page: int,
    size: int,
) -> tuple[list[Word], int]:
    query = select(Word).where(Word.deck_id == deck_id)
    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar_one()
    query = query.order_by(Word.created_at.desc()).offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    words = result.scalars().all()
    # eagerly load variant_groups for each word
    for word in words:
        await db.refresh(word, ["variant_groups"])
    return words, total


async def get_word(db: AsyncSession, word_id: str, deck_id: str) -> Word | None:
    result = await db.execute(
        select(Word).where(Word.id == word_id, Word.deck_id == deck_id)
    )
    word = result.scalar_one_or_none()
    if word:
        await db.refresh(word, ["variant_groups"])
    return word


async def create_word(db: AsyncSession, deck_id: str, data: WordCreate) -> Word:
    now = datetime.now(timezone.utc)
    word = Word(
        id=str(uuid.uuid4()),
        deck_id=deck_id,
        hanzi=data.hanzi,
        note=data.note,
        known_count=0,
        unknown_count=0,
        created_at=now,
        updated_at=now,
    )
    db.add(word)

    variants = data.variants if data.variants else [{}]
    for i, v in enumerate(variants):
        vg = VariantGroup(
            id=str(uuid.uuid4()),
            word_id=word.id,
            pinyin=getattr(v, "pinyin", None),
            han_viet=getattr(v, "han_viet", None),
            part_of_speech=getattr(v, "part_of_speech", None),
            meaning=getattr(v, "meaning", None),
            sort_order=i,
        )
        db.add(vg)

    # bump card_count on the deck
    deck_result = await db.execute(select(Deck).where(Deck.id == deck_id))
    deck = deck_result.scalar_one_or_none()
    if deck:
        deck.card_count += 1
        deck.updated_at = now

    await db.commit()
    await db.refresh(word, ["variant_groups"])
    return word


async def update_word(db: AsyncSession, word: Word, data: WordUpdate) -> Word:
    now = datetime.now(timezone.utc)
    if data.hanzi is not None:
        word.hanzi = data.hanzi
    if data.note is not None or "note" in data.model_fields_set:
        word.note = data.note
    word.updated_at = now

    if data.variants is not None:
        # replace all variant groups
        existing_result = await db.execute(
            select(VariantGroup).where(VariantGroup.word_id == word.id)
        )
        for vg in existing_result.scalars().all():
            await db.delete(vg)

        for i, v in enumerate(data.variants):
            vg = VariantGroup(
                id=str(uuid.uuid4()),
                word_id=word.id,
                pinyin=v.pinyin,
                han_viet=v.han_viet,
                part_of_speech=v.part_of_speech,
                meaning=v.meaning,
                sort_order=i,
            )
            db.add(vg)

        # ensure at least 1 variant remains
        if not data.variants:
            db.add(VariantGroup(id=str(uuid.uuid4()), word_id=word.id, sort_order=0))

    await db.commit()
    await db.refresh(word, ["variant_groups"])
    return word


async def delete_word(db: AsyncSession, word: Word) -> None:
    deck_result = await db.execute(select(Deck).where(Deck.id == word.deck_id))
    deck = deck_result.scalar_one_or_none()
    if deck and deck.card_count > 0:
        deck.card_count -= 1
        deck.updated_at = datetime.now(timezone.utc)

    await db.delete(word)
    await db.commit()


async def lookup_hanzi(hanzi: str) -> list[dict]:
    """Proxy to hanzii.net — returns list of variant dicts on success, empty list on failure."""
    url = f"https://hanzii.net/api/search/{hanzi}?type=word&lang=vi"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, headers={"User-Agent": "FriFlash/1.0"})
            if resp.status_code != 200:
                return []
            data = resp.json()
            return _parse_hanzii(data)
    except Exception:
        return []


def _parse_hanzii(data: dict) -> list[dict]:
    results = []
    entries = data.get("data", [])
    if not isinstance(entries, list):
        return results

    for i, entry in enumerate(entries[:5]):
        pinyin = entry.get("pinyin") or entry.get("pron") or None
        meaning_raw = entry.get("means") or entry.get("meaning") or []
        if isinstance(meaning_raw, list):
            meaning = "; ".join(
                str(m.get("mean") or m) for m in meaning_raw if m
            )
        else:
            meaning = str(meaning_raw) if meaning_raw else None

        results.append({
            "pinyin": pinyin,
            "han_viet": entry.get("han_viet") or None,
            "part_of_speech": entry.get("kind") or entry.get("pos") or None,
            "meaning": meaning or None,
            "sort_order": i,
        })

    return results
