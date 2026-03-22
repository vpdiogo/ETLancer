import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import connection as crud
from app.schemas.connection import (
    ConnectionCreate,
    ConnectionRead,
    ConnectionUpdate,
)

router = APIRouter(prefix="/connections", tags=["connections"])


@router.post("/", response_model=ConnectionRead, status_code=201)
async def create_connection(
    data: ConnectionCreate, db: AsyncSession = Depends(get_db)
):
    return await crud.create_connection(db, data)


@router.get("/", response_model=list[ConnectionRead])
async def list_connections(
    skip: int = 0,
    limit: int = 100,
    connector_type: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await crud.get_connections(
        db,
        skip=skip,
        limit=limit,
        connector_type=connector_type,
    )


@router.get("/{connection_id}", response_model=ConnectionRead)
async def get_connection(
    connection_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    conn = await crud.get_connection(db, connection_id)
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    return conn


@router.put("/{connection_id}", response_model=ConnectionRead)
async def update_connection(
    connection_id: uuid.UUID,
    data: ConnectionUpdate,
    db: AsyncSession = Depends(get_db),
):
    conn = await crud.update_connection(db, connection_id, data)
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    return conn


@router.delete("/{connection_id}", status_code=204)
async def delete_connection(
    connection_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    deleted = await crud.delete_connection(db, connection_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Connection not found")


@router.post("/{connection_id}/test")
async def test_connection(
    connection_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    conn = await crud.get_connection(db, connection_id)
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")

    from app.connectors.registry import get_connector
    from app.core.encryption import decrypt_credentials

    try:
        creds = (
            decrypt_credentials(conn.credentials)
            if conn.credentials
            else {}
        )
        connector = get_connector(
            conn.connector_type,
            conn.config,
            creds,
        )
        await connector.test_connection()
        return {"status": "ok", "message": "Connection successful"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
