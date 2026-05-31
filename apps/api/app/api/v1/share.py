from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.session import get_db
from ...schemas.word import WordOut
from ...services import deck as deck_svc
from ...services import word as word_svc
from pydantic import BaseModel

router = APIRouter(prefix="/share", tags=["share"])


class SharedDeckWithWords(BaseModel):
    id: str
    name: str
    description: str | None
    card_count: int
    words: list[WordOut]

    model_config = {"from_attributes": True}


@router.get("/{token}", response_model=SharedDeckWithWords)
async def get_shared_deck(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    deck = await deck_svc.get_deck_by_token(db, token)
    if not deck:
        raise HTTPException(status_code=404, detail="ERR-SHARE-NOT-FOUND")
    word_list, _ = await word_svc.list_words(db, deck.id, page=1, size=200)
    return {
        "id": deck.id,
        "name": deck.name,
        "description": deck.description,
        "card_count": deck.card_count,
        "words": word_list,
    }
