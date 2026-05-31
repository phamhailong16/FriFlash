from datetime import datetime
from pydantic import BaseModel, field_validator


class DeckCreate(BaseModel):
    name: str
    description: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("ERR-D001")
        if len(v) > 50:
            raise ValueError("ERR-D003")
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 200:
            raise ValueError("ERR-D004")
        return v


class DeckUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("ERR-D001")
        if len(v) > 50:
            raise ValueError("ERR-D003")
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 200:
            raise ValueError("ERR-D004")
        return v


class DeckOut(BaseModel):
    id: str
    name: str
    description: str | None
    card_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DeckListResponse(BaseModel):
    items: list[DeckOut]
    total: int
    page: int
    size: int
    pages: int


class MergeRequest(BaseModel):
    source_id: str
    target_id: str


class BulkDeleteRequest(BaseModel):
    ids: list[str]
