import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pipeline_run import PipelineRun


async def create_pipeline_run(db: AsyncSession, pipeline_id: uuid.UUID) -> PipelineRun:
    run = PipelineRun(pipeline_id=pipeline_id, status="pending")
    db.add(run)
    await db.commit()
    await db.refresh(run)
    return run


async def get_pipeline_run(db: AsyncSession, run_id: uuid.UUID) -> PipelineRun | None:
    result = await db.execute(select(PipelineRun).where(PipelineRun.id == run_id))
    return result.scalar_one_or_none()


async def get_pipeline_runs(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    pipeline_id: uuid.UUID | None = None,
    status: str | None = None,
) -> list[PipelineRun]:
    query = select(PipelineRun)
    if pipeline_id:
        query = query.where(PipelineRun.pipeline_id == pipeline_id)
    if status:
        query = query.where(PipelineRun.status == status)
    query = query.offset(skip).limit(limit).order_by(PipelineRun.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def update_pipeline_run(
    db: AsyncSession, run_id: uuid.UUID, **kwargs
) -> PipelineRun | None:
    run = await get_pipeline_run(db, run_id)
    if not run:
        return None
    for field, value in kwargs.items():
        setattr(run, field, value)
    await db.commit()
    await db.refresh(run)
    return run
