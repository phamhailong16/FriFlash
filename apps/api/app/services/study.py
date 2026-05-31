import uuid
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..db.models.word import Word
from ..db.models.study_session import StudySession
from ..schemas.study import StudySessionCreate


async def get_study_words(db: AsyncSession, deck_id: str) -> list[Word]:
    result = await db.execute(select(Word).where(Word.deck_id == deck_id))
    words = result.scalars().all()
    for word in words:
        await db.refresh(word, ["variant_groups"])
    return list(words)


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
    else:
        word.unknown_count += 1
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
