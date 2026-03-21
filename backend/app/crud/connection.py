import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.connection import Connection
from app.schemas.connection import ConnectionCreate, ConnectionUpdate


async def create_connection(
    db: AsyncSession, data: ConnectionCreate
) -> Connection:
    conn = Connection(**data.model_dump())
    db.add(conn)
    await db.commit()
    await db.refresh(conn)
    return conn


async def get_connection(
    db: AsyncSession, connection_id: uuid.UUID
) -> Connection | None:
    result = await db.execute(
        select(Connection).where(
            Connection.id == connection_id
        )
    )
    return result.scalar_one_or_none()


async def get_connections(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    connector_type: str | None = None,
) -> list[Connection]:
    query = select(Connection)
    if connector_type:
        query = query.where(Connection.connector_type == connector_type)
    query = (
        query.offset(skip)
        .limit(limit)
        .order_by(Connection.created_at.desc())
    )
    result = await db.execute(query)
    return list(result.scalars().all())


async def update_connection(
    db: AsyncSession, connection_id: uuid.UUID, data: ConnectionUpdate
) -> Connection | None:
    conn = await get_connection(db, connection_id)
    if not conn:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(conn, field, value)
    await db.commit()
    await db.refresh(conn)
    return conn


async def delete_connection(db: AsyncSession, connection_id: uuid.UUID) -> bool:
    conn = await get_connection(db, connection_id)
    if not conn:
        return False
    await db.delete(conn)
    await db.commit()
    return True
