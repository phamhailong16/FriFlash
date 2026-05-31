from datetime import datetime, timezone, date
from sqlalchemy import String, Text, Integer, Float, DateTime, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..base import Base


class Word(Base):
    __tablename__ = "words"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    deck_id: Mapped[str] = mapped_column(String(36), ForeignKey("decks.id", ondelete="CASCADE"), nullable=False, index=True)
    hanzi: Mapped[str] = mapped_column(String(50), nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    known_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    unknown_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    ease_factor: Mapped[float] = mapped_column(Float, default=2.5, nullable=False)
    sm2_interval: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    repetitions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    next_review_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    deck: Mapped["Deck"] = relationship(back_populates="words")  # type: ignore[name-defined]
    variant_groups: Mapped[list["VariantGroup"]] = relationship(
        back_populates="word",
        cascade="all, delete-orphan",
        order_by="VariantGroup.sort_order",
    )

    @property
    def status(self) -> str:
        if self.known_count == 0 and self.unknown_count == 0:
            return "new"
        if self.known_count >= 5 and self.known_count > self.unknown_count:
            return "mastered"
        if self.known_count > self.unknown_count:
            return "familiar"
        return "learning"


class VariantGroup(Base):
    __tablename__ = "variant_groups"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    word_id: Mapped[str] = mapped_column(String(36), ForeignKey("words.id", ondelete="CASCADE"), nullable=False, index=True)
    pinyin: Mapped[str | None] = mapped_column(String(100), nullable=True)
    han_viet: Mapped[str | None] = mapped_column(String(100), nullable=True)
    part_of_speech: Mapped[str | None] = mapped_column(String(50), nullable=True)
    meaning: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    word: Mapped["Word"] = relationship(back_populates="variant_groups")
