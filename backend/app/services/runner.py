import asyncio
import logging

from app.models.pipeline import Pipeline
from app.models.pipeline_run import PipelineRun

logger = logging.getLogger(__name__)

_background_tasks: set[asyncio.Task] = set()


async def trigger_run(pipeline: Pipeline, run: PipelineRun) -> None:
    from app.orchestration.flows import run_etl_pipeline

    task = asyncio.create_task(
        run_etl_pipeline(
            pipeline_id=str(pipeline.id),
            run_id=str(run.id),
        )
    )
    _background_tasks.add(task)
    task.add_done_callback(_background_tasks.discard)
