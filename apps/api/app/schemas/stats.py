from pydantic import BaseModel


class StatsOverview(BaseModel):
    total_decks: int
    total_words: int
    mastered_words: int
    total_sessions: int
    streak_days: int


class DailyActivity(BaseModel):
    date: str  # YYYY-MM-DD
    cards_studied: int
    known: int
    unknown: int


class ActivityResponse(BaseModel):
    days: int
    data: list[DailyActivity]


class WordStatusCount(BaseModel):
    new: int
    learning: int
    familiar: int
    mastered: int
    total: int


class DeckStat(BaseModel):
    deck_id: str
    name: str
    total_words: int
    new: int
    learning: int
    familiar: int
    mastered: int


class BreakdownResponse(BaseModel):
    global_status: WordStatusCount
    decks: list[DeckStat]
