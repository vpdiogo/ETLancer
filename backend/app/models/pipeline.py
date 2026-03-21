import uuid
from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Pipeline(Base):
    __tablename__ = "pipelines"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_connection_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("connections.id"), nullable=False
    )
    extraction_config: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    transform_config: Mapped[list | None] = mapped_column(JSON, nullable=True)
    load_config: Mapped[dict] = mapped_column(JSON, nullable=False)
    schedule: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    source_connection = relationship("Connection", back_populates="pipelines")
    runs = relationship(
        "PipelineRun",
        back_populates="pipeline",
        order_by="PipelineRun.created_at.desc()",
    )
