import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

from app.core.database import get_db
from app.crud import pipeline as crud
from app.crud import pipeline_run as run_crud
from app.schemas.pipeline import PipelineCreate, PipelineRead, PipelineUpdate
from app.schemas.pipeline_run import PipelineRunRead

router = APIRouter(prefix="/pipelines", tags=["pipelines"])


@router.post("/", response_model=PipelineRead, status_code=201)
async def create_pipeline(
    data: PipelineCreate, db: AsyncSession = Depends(get_db)
):
    return await crud.create_pipeline(db, data)


@router.get("/", response_model=list[PipelineRead])
async def list_pipelines(
    skip: int = 0,
    limit: int = 100,
    is_active: bool | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await crud.get_pipelines(
        db, skip=skip, limit=limit, is_active=is_active
    )


@router.get("/{pipeline_id}", response_model=PipelineRead)
async def get_pipeline(
    pipeline_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    pipeline = await crud.get_pipeline(db, pipeline_id)
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipeline


@router.put("/{pipeline_id}", response_model=PipelineRead)
async def update_pipeline(
    pipeline_id: uuid.UUID,
    data: PipelineUpdate,
    db: AsyncSession = Depends(get_db),
):
    pipeline = await crud.update_pipeline(db, pipeline_id, data)
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipeline


@router.delete("/{pipeline_id}", status_code=204)
async def delete_pipeline(
    pipeline_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    deleted = await crud.delete_pipeline(db, pipeline_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Pipeline not found")


@router.post(
    "/{pipeline_id}/run",
    response_model=PipelineRunRead,
    status_code=201,
)
async def trigger_pipeline_run(
    pipeline_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    pipeline = await crud.get_pipeline(db, pipeline_id)
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    run = await run_crud.create_pipeline_run(db, pipeline_id)

    from app.services.runner import trigger_run

    try:
        await trigger_run(pipeline, run)
    except Exception as e:
        logger.error(f"Failed to trigger run {run.id}: {e}")
        run.status = "failed"
        run.error_message = f"Failed to start: {e}"
        await db.commit()
        await db.refresh(run)

    return run
