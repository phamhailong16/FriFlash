import math
import uuid
from datetime import datetime, timezone
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from ..db.models.deck import Deck
from ..db.models.word import Word
from ..schemas.deck import DeckCreate, DeckUpdate


async def list_decks(
    db: AsyncSession,
    user_id: str,
    search: str | None,
    page: int,
    size: int,
) -> tuple[list[Deck], int]:
    query = select(Deck).where(Deck.user_id == user_id)
    if search:
        query = query.where(Deck.name.ilike(f"%{search}%"))
    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar_one()
    query = query.order_by(Deck.updated_at.desc()).offset((page - 1) * size).limit(size)
    result = await db.execute(query)
    return result.scalars().all(), total


async def get_deck(db: AsyncSession, deck_id: str, user_id: str) -> Deck | None:
    result = await db.execute(
        select(Deck).where(Deck.id == deck_id, Deck.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def name_exists(db: AsyncSession, user_id: str, name: str, exclude_id: str | None = None) -> bool:
    query = select(Deck.id).where(Deck.user_id == user_id, Deck.name == name)
    if exclude_id:
        query = query.where(Deck.id != exclude_id)
    result = await db.execute(query)
    return result.scalar_one_or_none() is not None


async def create_deck(db: AsyncSession, user_id: str, data: DeckCreate) -> Deck:
    now = datetime.now(timezone.utc)
    deck = Deck(
        id=str(uuid.uuid4()),
        user_id=user_id,
        name=data.name,
        description=data.description,
        card_count=0,
        created_at=now,
        updated_at=now,
    )
    db.add(deck)
    await db.commit()
    await db.refresh(deck)
    return deck


async def update_deck(db: AsyncSession, deck: Deck, data: DeckUpdate) -> Deck:
    if data.name is not None:
        deck.name = data.name
    if data.description is not None or "description" in data.model_fields_set:
        deck.description = data.description
    deck.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(deck)
    return deck


async def delete_deck(db: AsyncSession, deck: Deck) -> None:
    await db.delete(deck)
    await db.commit()


async def bulk_delete_decks(db: AsyncSession, user_id: str, ids: list[str]) -> int:
    result = await db.execute(
        select(Deck).where(Deck.user_id == user_id, Deck.id.in_(ids))
    )
    decks = result.scalars().all()
    for deck in decks:
        await db.delete(deck)
    await db.commit()
    return len(decks)


async def merge_decks(db: AsyncSession, user_id: str, source_id: str, target_id: str) -> Deck:
    source_result = await db.execute(
        select(Deck).where(Deck.id == source_id, Deck.user_id == user_id)
    )
    source = source_result.scalar_one_or_none()

    target_result = await db.execute(
        select(Deck).where(Deck.id == target_id, Deck.user_id == user_id)
    )
    target = target_result.scalar_one_or_none()

    if not source or not target:
        return None

    # Move all words from source → target
    words_result = await db.execute(select(Word).where(Word.deck_id == source_id))
    words = words_result.scalars().all()
    for word in words:
        word.deck_id = target_id

    # Rename target to "SourceName-TargetName" (max 50 chars)
    merged_name = f"{source.name}-{target.name}"
    if len(merged_name) > 50:
        merged_name = merged_name[:47] + "..."

    # Make sure name is unique for this user
    final_name = merged_name
    counter = 1
    while await name_exists(db, user_id, final_name, exclude_id=target_id):
        suffix = f" ({counter})"
        base = merged_name[: 50 - len(suffix)]
        final_name = base + suffix
        counter += 1

    target.name = final_name
    target.card_count = len(words) + target.card_count
    target.updated_at = datetime.now(timezone.utc)

    await db.delete(source)
    await db.commit()
    await db.refresh(target)
    return target
