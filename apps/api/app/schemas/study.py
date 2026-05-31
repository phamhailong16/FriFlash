from datetime import datetime
from pydantic import BaseModel, field_validator


class EvaluateRequest(BaseModel):
    word_id: str
    result: str

    @field_validator("result")
    @classmethod
    def validate_result(cls, v: str) -> str:
        if v not in ("known", "unknown"):
            raise ValueError("ERR-S001")
        return v


class EvaluateResponse(BaseModel):
    word_id: str
    known_count: int
    unknown_count: int
    status: str


class StudySessionCreate(BaseModel):
    total_cards: int
    known_count: int
    unknown_count: int


class StudySessionOut(BaseModel):
    id: str
    user_id: str
    deck_id: str
    total_cards: int
    known_count: int
    unknown_count: int
    started_at: datetime
    completed_at: datetime | None

    model_config = {"from_attributes": True}
