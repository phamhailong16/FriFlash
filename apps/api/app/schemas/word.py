from datetime import datetime, date
from pydantic import BaseModel, field_validator


class VariantGroupCreate(BaseModel):
    pinyin: str | None = None
    han_viet: str | None = None
    part_of_speech: str | None = None
    meaning: str | None = None
    sort_order: int = 0


class VariantGroupOut(BaseModel):
    id: str
    pinyin: str | None
    han_viet: str | None
    part_of_speech: str | None
    meaning: str | None
    sort_order: int

    model_config = {"from_attributes": True}


class WordCreate(BaseModel):
    hanzi: str
    note: str | None = None
    variants: list[VariantGroupCreate] = []

    @field_validator("hanzi")
    @classmethod
    def validate_hanzi(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("ERR-W001")
        return v


class WordUpdate(BaseModel):
    hanzi: str | None = None
    note: str | None = None
    variants: list[VariantGroupCreate] | None = None

    @field_validator("hanzi")
    @classmethod
    def validate_hanzi(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("ERR-W001")
        return v


class WordOut(BaseModel):
    id: str
    deck_id: str
    hanzi: str
    note: str | None
    known_count: int
    unknown_count: int
    status: str
    ease_factor: float
    sm2_interval: int
    repetitions: int
    next_review_date: date | None
    created_at: datetime
    updated_at: datetime
    variant_groups: list[VariantGroupOut]

    model_config = {"from_attributes": True}


class WordListResponse(BaseModel):
    items: list[WordOut]
    total: int
    page: int
    size: int
    pages: int
