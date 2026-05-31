from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ...db.session import get_db
from ...db.models.user import User
from ...core.deps import get_current_user
from ...schemas.word import WordOut
from ...schemas.study import (
    EvaluateRequest,
    EvaluateResponse,
    StudySessionCreate,
    StudySessionOut,
)
from ...services import deck as deck_svc
from ...services import study as study_svc

router = APIRouter(prefix="/decks/{deck_id}/study", tags=["study"])


async def _get_deck_or_404(deck_id: str, current_user: User, db: AsyncSession):
    deck = await deck_svc.get_deck(db, deck_id, current_user.id)
    if not deck:
        raise HTTPException(status_code=404, detail="ERR-D005")
    return deck


@router.get("/words", response_model=list[WordOut])
async def get_study_words(
    deck_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_deck_or_404(deck_id, current_user, db)
    return await study_svc.get_study_words(db, deck_id)


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_word(
    deck_id: str,
    body: EvaluateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_deck_or_404(deck_id, current_user, db)
    word = await study_svc.evaluate_word(db, body.word_id, deck_id, body.result)
    if not word:
        raise HTTPException(status_code=404, detail="ERR-W002")
    return EvaluateResponse(
        word_id=word.id,
        known_count=word.known_count,
        unknown_count=word.unknown_count,
        status=word.status,
    )


@router.post("/session", response_model=StudySessionOut, status_code=201)
async def save_session(
    deck_id: str,
    body: StudySessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_deck_or_404(deck_id, current_user, db)
    return await study_svc.save_session(db, current_user.id, deck_id, body)
