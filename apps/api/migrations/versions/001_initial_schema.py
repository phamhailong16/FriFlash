"""initial_schema

Revision ID: 001
Revises:
Create Date: 2026-05-31
"""
from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("name", sa.String(50), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "decks",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(50), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("card_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("user_id", "name", name="uq_deck_user_name"),
    )
    op.create_index("ix_decks_user_id", "decks", ["user_id"])

    op.create_table(
        "words",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("deck_id", sa.String(36), sa.ForeignKey("decks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("hanzi", sa.String(50), nullable=False),
        sa.Column("note", sa.Text, nullable=True),
        sa.Column("known_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("unknown_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_words_deck_id", "words", ["deck_id"])

    op.create_table(
        "variant_groups",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("word_id", sa.String(36), sa.ForeignKey("words.id", ondelete="CASCADE"), nullable=False),
        sa.Column("pinyin", sa.String(100), nullable=True),
        sa.Column("han_viet", sa.String(100), nullable=True),
        sa.Column("part_of_speech", sa.String(50), nullable=True),
        sa.Column("meaning", sa.Text, nullable=True),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
    )
    op.create_index("ix_variant_groups_word_id", "variant_groups", ["word_id"])

    op.create_table(
        "study_sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("deck_id", sa.String(36), sa.ForeignKey("decks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("total_cards", sa.Integer, nullable=False, server_default="0"),
        sa.Column("known_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("unknown_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_study_sessions_user_id", "study_sessions", ["user_id"])
    op.create_index("ix_study_sessions_started_at", "study_sessions", ["started_at"])


def downgrade() -> None:
    op.drop_table("study_sessions")
    op.drop_table("variant_groups")
    op.drop_table("words")
    op.drop_table("decks")
    op.drop_table("users")
