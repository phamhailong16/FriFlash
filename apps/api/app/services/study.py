import uuid
from datetime import datetime, timezone, date, timedelta
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from ..db.models.word import Word
from ..db.models.study_session import StudySession
from ..schemas.study import StudySessionCreate


def _sm2_update(word: Word, quality: int) -> None:
    """SM-2 algorithm: quality 4=known, 1=unknown."""
    ef = max(1.3, word.ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    word.ease_factor = ef
    if quality < 3:
        word.repetitions = 0
        word.sm2_interval = 1
    else:
        if word.repetitions == 0:
            word.sm2_interval = 1
        elif word.repetitions == 1:
            word.sm2_interval = 6
        else:
            word.sm2_interval = round(word.sm2_interval * ef)
        word.repetitions += 1
    word.next_review_date = date.today() + timedelta(days=word.sm2_interval)


async def get_study_words(db: AsyncSession, deck_id: str, due_only: bool = False) -> list[Word]:
    query = select(Word).where(Word.deck_id == deck_id).options(selectinload(Word.variant_groups))
    if due_only:
        today = date.today()
        query = query.where(
            or_(Word.next_review_date.is_(None), Word.next_review_date <= today)
        )
    result = await db.execute(query)
    return list(result.scalars().all())


async def evaluate_word(
    db: AsyncSession, word_id: str, deck_id: str, result: str
) -> Word | None:
    word_result = await db.execute(
        select(Word).where(Word.id == word_id, Word.deck_id == deck_id)
    )
    word = word_result.scalar_one_or_none()
    if not word:
        return None
    if result == "known":
        word.known_count += 1
        _sm2_update(word, quality=4)
    else:
        word.unknown_count += 1
        _sm2_update(word, quality=1)
    word.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(word, ["variant_groups"])
    return word


async def save_session(
    db: AsyncSession,
    user_id: str,
    deck_id: str,
    data: StudySessionCreate,
) -> StudySession:
    now = datetime.now(timezone.utc)
    session = StudySession(
        id=str(uuid.uuid4()),
        user_id=user_id,
        deck_id=deck_id,
        total_cards=data.total_cards,
        known_count=data.known_count,
        unknown_count=data.unknown_count,
        started_at=now,
        completed_at=now,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session
