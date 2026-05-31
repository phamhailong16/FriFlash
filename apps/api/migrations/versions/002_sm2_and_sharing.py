"""sm2_and_sharing

Revision ID: 002
Revises: 001
Create Date: 2026-05-31
"""
from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # SM-2 fields on words
    op.add_column("words", sa.Column("ease_factor", sa.Float(), nullable=False, server_default="2.5"))
    op.add_column("words", sa.Column("sm2_interval", sa.Integer(), nullable=False, server_default="1"))
    op.add_column("words", sa.Column("repetitions", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("words", sa.Column("next_review_date", sa.Date(), nullable=True))
    op.create_index("ix_words_next_review_date", "words", ["next_review_date"])

    # Sharing fields on decks
    op.add_column("decks", sa.Column("is_public", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("decks", sa.Column("share_token", sa.String(12), nullable=True))
    op.create_index("ix_decks_share_token", "decks", ["share_token"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_decks_share_token", table_name="decks")
    op.drop_column("decks", "share_token")
    op.drop_column("decks", "is_public")

    op.drop_index("ix_words_next_review_date", table_name="words")
    op.drop_column("words", "next_review_date")
    op.drop_column("words", "repetitions")
    op.drop_column("words", "sm2_interval")
    op.drop_column("words", "ease_factor")
