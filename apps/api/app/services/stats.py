from datetime import date, datetime, timedelta, timezone
from sqlalchemy import select, func, case, and_
from sqlalchemy.ext.asyncio import AsyncSession
from ..db.models.deck import Deck
from ..db.models.word import Word
from ..db.models.study_session import StudySession
from ..schemas.stats import (
    StatsOverview,
    DailyActivity,
    ActivityResponse,
    WordStatusCount,
    DeckStat,
    BreakdownResponse,
)


def _word_status(known: int, unknown: int) -> str:
    if known == 0 and unknown == 0:
        return "new"
    if known >= 5 and known > unknown:
        return "mastered"
    if known > unknown:
        return "familiar"
    return "learning"


async def get_overview(db: AsyncSession, user_id: str) -> StatsOverview:
    deck_result = await db.execute(
        select(func.count()).select_from(Deck).where(Deck.user_id == user_id)
    )
    total_decks = deck_result.scalar_one() or 0

    word_result = await db.execute(
        select(
            func.count().label("total"),
            func.sum(
                case(
                    (and_(Word.known_count >= 5, Word.known_count > Word.unknown_count), 1),
                    else_=0,
                )
            ).label("mastered"),
        )
        .select_from(Word)
        .join(Deck, Word.deck_id == Deck.id)
        .where(Deck.user_id == user_id)
    )
    word_row = word_result.one()
    total_words = word_row.total or 0
    mastered_words = int(word_row.mastered or 0)

    session_result = await db.execute(
        select(func.count()).select_from(StudySession).where(StudySession.user_id == user_id)
    )
    total_sessions = session_result.scalar_one() or 0

    streak_result = await db.execute(
        select(func.date(StudySession.started_at).label("day"))
        .where(StudySession.user_id == user_id)
        .distinct()
        .order_by(func.date(StudySession.started_at).desc())
    )
    session_days = [row.day for row in streak_result]

    streak = 0
    today = date.today()
    for i, d in enumerate(session_days):
        expected = today - timedelta(days=i)
        if d == expected:
            streak += 1
        else:
            break

    return StatsOverview(
        total_decks=total_decks,
        total_words=total_words,
        mastered_words=mastered_words,
        total_sessions=total_sessions,
        streak_days=streak,
    )


async def get_activity(db: AsyncSession, user_id: str, days: int) -> ActivityResponse:
    since = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(
            func.date(StudySession.started_at).label("day"),
            func.sum(StudySession.total_cards).label("cards_studied"),
            func.sum(StudySession.known_count).label("known"),
            func.sum(StudySession.unknown_count).label("unknown"),
        )
        .where(StudySession.user_id == user_id, StudySession.started_at >= since)
        .group_by(func.date(StudySession.started_at))
        .order_by(func.date(StudySession.started_at))
    )
    rows = result.all()

    date_map: dict[date, dict] = {}
    for row in rows:
        date_map[row.day] = {
            "cards_studied": int(row.cards_studied or 0),
            "known": int(row.known or 0),
            "unknown": int(row.unknown or 0),
        }

    data: list[DailyActivity] = []
    today = date.today()
    for i in range(days - 1, -1, -1):
        d = today - timedelta(days=i)
        entry = date_map.get(d, {"cards_studied": 0, "known": 0, "unknown": 0})
        data.append(DailyActivity(date=d.isoformat(), **entry))

    return ActivityResponse(days=days, data=data)


async def get_breakdown(db: AsyncSession, user_id: str) -> BreakdownResponse:
    result = await db.execute(
        select(
            Word.known_count,
            Word.unknown_count,
            Deck.id.label("deck_id"),
            Deck.name.label("deck_name"),
        )
        .select_from(Word)
        .join(Deck, Word.deck_id == Deck.id)
        .where(Deck.user_id == user_id)
    )
    rows = result.all()

    global_counts: dict[str, int] = {"new": 0, "learning": 0, "familiar": 0, "mastered": 0}
    deck_map: dict[str, dict] = {}

    for row in rows:
        status = _word_status(row.known_count, row.unknown_count)
        global_counts[status] += 1

        if row.deck_id not in deck_map:
            deck_map[row.deck_id] = {
                "deck_id": row.deck_id,
                "name": row.deck_name,
                "total_words": 0,
                "new": 0,
                "learning": 0,
                "familiar": 0,
                "mastered": 0,
            }
        deck_map[row.deck_id][status] += 1
        deck_map[row.deck_id]["total_words"] += 1

    total = sum(global_counts.values())
    global_status = WordStatusCount(total=total, **global_counts)
    decks = sorted(
        [DeckStat(**v) for v in deck_map.values()],
        key=lambda d: d.total_words,
        reverse=True,
    )

    return BreakdownResponse(global_status=global_status, decks=decks)
