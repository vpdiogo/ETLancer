import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PipelineBase(BaseModel):
    name: str
    description: str | None = None
    source_connection_id: uuid.UUID
    extraction_config: dict | None = None
    transform_config: list[dict] | None = None
    load_config: dict
    schedule: str | None = None
    is_active: bool = True


class PipelineCreate(PipelineBase):
    pass


class PipelineUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    source_connection_id: uuid.UUID | None = None
    extraction_config: dict | None = None
    transform_config: list[dict] | None = None
    load_config: dict | None = None
    schedule: str | None = None
    is_active: bool | None = None


class PipelineRead(PipelineBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
