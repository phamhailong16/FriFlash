from datetime import datetime, timezone
from sqlalchemy import String, Text, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..base import Base


class Deck(Base):
    __tablename__ = "decks"
    __table_args__ = (UniqueConstraint("user_id", "name", name="uq_deck_user_name"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    card_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    share_token: Mapped[str | None] = mapped_column(String(12), nullable=True, unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship(back_populates="decks")  # type: ignore[name-defined]
    words: Mapped[list["Word"]] = relationship(back_populates="deck", cascade="all, delete-orphan")  # type: ignore[name-defined]
    study_sessions: Mapped[list["StudySession"]] = relationship(back_populates="deck", cascade="all, delete-orphan")  # type: ignore[name-defined]
