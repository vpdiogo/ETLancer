import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import pipeline_run as crud
from app.schemas.pipeline_run import PipelineRunRead

router = APIRouter(prefix="/runs", tags=["runs"])


@router.get("/", response_model=list[PipelineRunRead])
async def list_runs(
    skip: int = 0,
    limit: int = 100,
    pipeline_id: uuid.UUID | None = None,
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await crud.get_pipeline_runs(
        db, skip=skip, limit=limit, pipeline_id=pipeline_id, status=status
    )


@router.get("/{run_id}", response_model=PipelineRunRead)
async def get_run(run_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    run = await crud.get_pipeline_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run
