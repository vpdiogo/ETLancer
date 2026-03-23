import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pipeline import Pipeline
from app.schemas.pipeline import PipelineCreate, PipelineUpdate


async def create_pipeline(db: AsyncSession, data: PipelineCreate) -> Pipeline:
    pipeline = Pipeline(**data.model_dump())
    db.add(pipeline)
    await db.commit()
    await db.refresh(pipeline)
    return pipeline


async def get_pipeline(
    db: AsyncSession, pipeline_id: uuid.UUID
) -> Pipeline | None:
    result = await db.execute(
        select(Pipeline).where(Pipeline.id == pipeline_id)
    )
    return result.scalar_one_or_none()


async def get_pipelines(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    is_active: bool | None = None,
) -> list[Pipeline]:
    query = select(Pipeline)
    if is_active is not None:
        query = query.where(Pipeline.is_active == is_active)
    query = query.offset(skip).limit(limit).order_by(Pipeline.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def update_pipeline(
    db: AsyncSession, pipeline_id: uuid.UUID, data: PipelineUpdate
) -> Pipeline | None:
    pipeline = await get_pipeline(db, pipeline_id)
    if not pipeline:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(pipeline, field, value)
    await db.commit()
    await db.refresh(pipeline)
    return pipeline


async def delete_pipeline(db: AsyncSession, pipeline_id: uuid.UUID) -> bool:
    pipeline = await get_pipeline(db, pipeline_id)
    if not pipeline:
        return False
    await db.delete(pipeline)
    await db.commit()
    return True
