"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-03-22

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "connections",
        sa.Column(
            "id", UUID(as_uuid=True), primary_key=True
        ),
        sa.Column(
            "name", sa.String(255), unique=True, nullable=False
        ),
        sa.Column(
            "connector_type", sa.String(50), nullable=False
        ),
        sa.Column("config", sa.JSON, nullable=False),
        sa.Column("credentials", sa.Text, nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column(
            "is_active", sa.Boolean, default=True
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )

    op.create_table(
        "pipelines",
        sa.Column(
            "id", UUID(as_uuid=True), primary_key=True
        ),
        sa.Column(
            "name", sa.String(255), unique=True, nullable=False
        ),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column(
            "source_connection_id",
            UUID(as_uuid=True),
            sa.ForeignKey("connections.id"),
            nullable=False,
        ),
        sa.Column(
            "extraction_config", sa.JSON, nullable=True
        ),
        sa.Column(
            "transform_config", sa.JSON, nullable=True
        ),
        sa.Column("load_config", sa.JSON, nullable=False),
        sa.Column(
            "schedule", sa.String(100), nullable=True
        ),
        sa.Column(
            "is_active", sa.Boolean, default=True
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )

    op.create_table(
        "pipeline_runs",
        sa.Column(
            "id", UUID(as_uuid=True), primary_key=True
        ),
        sa.Column(
            "pipeline_id",
            UUID(as_uuid=True),
            sa.ForeignKey("pipelines.id"),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.String(20),
            nullable=False,
            server_default="pending",
        ),
        sa.Column(
            "started_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "completed_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "rows_extracted", sa.Integer, default=0
        ),
        sa.Column(
            "rows_loaded", sa.Integer, default=0
        ),
        sa.Column(
            "error_message", sa.Text, nullable=True
        ),
        sa.Column(
            "prefect_flow_run_id",
            sa.String(255),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )


def downgrade() -> None:
    op.drop_table("pipeline_runs")
    op.drop_table("pipelines")
    op.drop_table("connections")
