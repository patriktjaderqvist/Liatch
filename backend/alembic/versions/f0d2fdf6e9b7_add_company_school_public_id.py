"""add_company_school_public_id

Revision ID: f0d2fdf6e9b7
Revises: 8b2f0f6f2f4e
Create Date: 2026-03-06 14:20:00.000000

"""
from typing import Sequence, Union
from uuid import uuid4

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f0d2fdf6e9b7"
down_revision: Union[str, Sequence[str], None] = "8b2f0f6f2f4e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _backfill_public_ids(connection, table_name: str) -> None:
    rows = connection.execute(
        sa.text(f"SELECT id FROM {table_name} WHERE public_id IS NULL OR TRIM(public_id) = ''")
    ).fetchall()
    for row in rows:
        connection.execute(
            sa.text(f"UPDATE {table_name} SET public_id = :public_id WHERE id = :id"),
            {"public_id": str(uuid4()), "id": row[0]},
        )


def upgrade() -> None:
    op.add_column("companies", sa.Column("public_id", sa.String(length=36), nullable=True))
    op.add_column("schools", sa.Column("public_id", sa.String(length=36), nullable=True))

    connection = op.get_bind()
    _backfill_public_ids(connection, "companies")
    _backfill_public_ids(connection, "schools")

    op.alter_column("companies", "public_id", existing_type=sa.String(length=36), nullable=False)
    op.alter_column("schools", "public_id", existing_type=sa.String(length=36), nullable=False)
    op.create_index(op.f("ix_companies_public_id"), "companies", ["public_id"], unique=True)
    op.create_index(op.f("ix_schools_public_id"), "schools", ["public_id"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_schools_public_id"), table_name="schools")
    op.drop_index(op.f("ix_companies_public_id"), table_name="companies")
    op.drop_column("schools", "public_id")
    op.drop_column("companies", "public_id")
