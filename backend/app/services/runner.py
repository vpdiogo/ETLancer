import asyncio

from app.models.pipeline import Pipeline
from app.models.pipeline_run import PipelineRun


async def trigger_run(
    pipeline: Pipeline, run: PipelineRun
) -> None:
    from app.orchestration.flows import run_etl_pipeline

    asyncio.create_task(
        run_etl_pipeline(
            pipeline_id=str(pipeline.id),
            run_id=str(run.id),
        )
    )
