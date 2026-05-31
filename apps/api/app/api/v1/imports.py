from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Body
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.session import get_db
from ...db.models.user import User
from ...core.deps import get_current_user
from ...schemas.import_ import ImportResult
from ...services import deck as deck_svc
from ...services import import_ as import_svc

MAX_FILE_BYTES = 10 * 1024 * 1024

router = APIRouter(prefix="/decks/{deck_id}", tags=["import"])


async def _get_deck_or_404(deck_id: str, current_user: User, db: AsyncSession):
    deck = await deck_svc.get_deck(db, deck_id, current_user.id)
    if not deck:
        raise HTTPException(status_code=404, detail="ERR-D005")
    return deck


@router.post("/import-excel", response_model=ImportResult)
async def import_excel(
    deck_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deck = await _get_deck_or_404(deck_id, current_user, db)

    content = await file.read()
    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="ERR-I003")

    filename = file.filename or "upload.xlsx"
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in ("xlsx", "xls"):
        raise HTTPException(status_code=422, detail="ERR-I005")

    try:
        imported, skipped = await import_svc.import_excel(db, deck, content, filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="ERR-I005")

    return ImportResult(
        deck_id=deck.id,
        deck_name=deck.name,
        imported_count=imported,
        skipped_count=skipped,
    )


@router.post("/import-sheets", response_model=ImportResult)
async def import_sheets(
    deck_id: str,
    url: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deck = await _get_deck_or_404(deck_id, current_user, db)

    try:
        imported, skipped = await import_svc.import_sheets(db, deck, url)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="ERR-I005")

    return ImportResult(
        deck_id=deck.id,
        deck_name=deck.name,
        imported_count=imported,
        skipped_count=skipped,
    )
