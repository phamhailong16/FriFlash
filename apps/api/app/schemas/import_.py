from pydantic import BaseModel


class ImportResult(BaseModel):
    deck_id: str
    deck_name: str
    imported_count: int
    skipped_count: int
