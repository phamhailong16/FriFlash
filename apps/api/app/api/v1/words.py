import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.session import get_db
from ...db.models.user import User
from ...core.deps import get_current_user
from ...schemas.word import WordCreate, WordUpdate, WordOut, WordListResponse
from ...services import deck as deck_svc
from ...services import word as word_svc

router = APIRouter(prefix="/decks/{deck_id}/words", tags=["words"])


async def _get_deck_or_404(deck_id: str, current_user: User, db: AsyncSession):
    deck = await deck_svc.get_deck(db, deck_id, current_user.id)
    if not deck:
        raise HTTPException(status_code=404, detail="ERR-D005")
    return deck


@router.get("", response_model=WordListResponse)
async def list_words(
    deck_id: str,
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_deck_or_404(deck_id, current_user, db)
    items, total = await word_svc.list_words(db, deck_id, page, size)
    return WordListResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=math.ceil(total / size) if total else 1,
    )


@router.post("", response_model=WordOut, status_code=201)
async def create_word(
    deck_id: str,
    body: WordCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_deck_or_404(deck_id, current_user, db)
    return await word_svc.create_word(db, deck_id, body)


@router.patch("/{word_id}", response_model=WordOut)
async def update_word(
    deck_id: str,
    word_id: str,
    body: WordUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_deck_or_404(deck_id, current_user, db)
    word = await word_svc.get_word(db, word_id, deck_id)
    if not word:
        raise HTTPException(status_code=404, detail="ERR-W002")
    return await word_svc.update_word(db, word, body)


@router.delete("/{word_id}", status_code=204)
async def delete_word(
    deck_id: str,
    word_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_deck_or_404(deck_id, current_user, db)
    word = await word_svc.get_word(db, word_id, deck_id)
    if not word:
        raise HTTPException(status_code=404, detail="ERR-W002")
    await word_svc.delete_word(db, word)


@router.get("/lookup", response_model=list[dict])
async def lookup_hanzi(
    deck_id: str,
    hanzi: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_deck_or_404(deck_id, current_user, db)
    return await word_svc.lookup_hanzi(hanzi)
