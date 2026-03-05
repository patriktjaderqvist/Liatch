"""add_student_public_id

Revision ID: 8b2f0f6f2f4e
Revises: 109ea3d98093
Create Date: 2026-03-03 15:30:00.000000

"""
from typing import Sequence, Union
from uuid import uuid4

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8b2f0f6f2f4e"
down_revision: Union[str, Sequence[str], None] = "109ea3d98093"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("students", sa.Column("public_id", sa.String(length=36), nullable=True))

    connection = op.get_bind()
    rows = connection.execute(
        sa.text("SELECT id FROM students WHERE public_id IS NULL OR TRIM(public_id) = ''")
    ).fetchall()

    for row in rows:
        connection.execute(
            sa.text("UPDATE students SET public_id = :public_id WHERE id = :id"),
            {"public_id": str(uuid4()), "id": row[0]},
        )

    op.alter_column("students", "public_id", existing_type=sa.String(length=36), nullable=False)
    op.create_index(op.f("ix_students_public_id"), "students", ["public_id"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_students_public_id"), table_name="students")
    op.drop_column("students", "public_id")
