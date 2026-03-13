import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PipelineRunRead(BaseModel):
    id: uuid.UUID
    pipeline_id: uuid.UUID
    status: str
    started_at: datetime | None = None
    completed_at: datetime | None = None
    rows_extracted: int = 0
    rows_loaded: int = 0
    error_message: str | None = None
    prefect_flow_run_id: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PipelineRunSummary(BaseModel):
    id: uuid.UUID
    status: str
    started_at: datetime | None = None
    completed_at: datetime | None = None
    rows_extracted: int = 0
    rows_loaded: int = 0

    model_config = ConfigDict(from_attributes=True)
