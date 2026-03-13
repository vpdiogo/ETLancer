import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ConnectionBase(BaseModel):
    name: str
    connector_type: str
    config: dict
    credentials: dict | None = None
    description: str | None = None
    is_active: bool = True


class ConnectionCreate(ConnectionBase):
    pass


class ConnectionUpdate(BaseModel):
    name: str | None = None
    connector_type: str | None = None
    config: dict | None = None
    credentials: dict | None = None
    description: str | None = None
    is_active: bool | None = None


class ConnectionRead(ConnectionBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
