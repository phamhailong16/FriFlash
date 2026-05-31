import math
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.session import get_db
from ...db.models.user import User
from ...core.deps import get_current_user
from ...schemas.deck import DeckCreate, DeckUpdate, DeckOut, DeckListResponse, MergeRequest, BulkDeleteRequest
from ...services import deck as deck_svc

router = APIRouter(prefix="/decks", tags=["decks"])


@router.get("", response_model=DeckListResponse)
async def list_decks(
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    items, total = await deck_svc.list_decks(db, current_user.id, search, page, size)
    return DeckListResponse(
        items=items,
        total=total,
        page=page,
        size=size,
        pages=math.ceil(total / size) if total else 1,
    )


@router.post("", response_model=DeckOut, status_code=201)
async def create_deck(
    body: DeckCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if await deck_svc.name_exists(db, current_user.id, body.name):
        raise HTTPException(status_code=409, detail="ERR-D002")
    return await deck_svc.create_deck(db, current_user.id, body)


@router.patch("/{deck_id}", response_model=DeckOut)
async def update_deck(
    deck_id: str,
    body: DeckUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deck = await deck_svc.get_deck(db, deck_id, current_user.id)
    if not deck:
        raise HTTPException(status_code=404, detail="ERR-D005")
    if body.name and body.name != deck.name:
        if await deck_svc.name_exists(db, current_user.id, body.name, exclude_id=deck_id):
            raise HTTPException(status_code=409, detail="ERR-D002")
    return await deck_svc.update_deck(db, deck, body)


@router.delete("/{deck_id}", status_code=204)
async def delete_deck(
    deck_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deck = await deck_svc.get_deck(db, deck_id, current_user.id)
    if not deck:
        raise HTTPException(status_code=404, detail="ERR-D005")
    await deck_svc.delete_deck(db, deck)


@router.post("/bulk-delete", status_code=204)
async def bulk_delete(
    body: BulkDeleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not body.ids:
        return
    await deck_svc.bulk_delete_decks(db, current_user.id, body.ids)


@router.post("/merge", response_model=DeckOut)
async def merge_decks(
    body: MergeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.source_id == body.target_id:
        raise HTTPException(status_code=400, detail="ERR-D009")
    result = await deck_svc.merge_decks(db, current_user.id, body.source_id, body.target_id)
    if not result:
        raise HTTPException(status_code=404, detail="ERR-D005")
    return result
