import asyncio
from datetime import datetime, timezone

from app.connectors.registry import get_connector
from app.core.database import AsyncSessionLocal
from app.core.encryption import decrypt_credentials
from app.crud.pipeline_run import update_pipeline_run
from app.models.pipeline import Pipeline
from app.models.pipeline_run import PipelineRun
from app.services.loader import load_to_database
from app.services.transform import apply_transforms


async def trigger_run(pipeline: Pipeline, run: PipelineRun) -> None:
    asyncio.create_task(_execute_run(pipeline, run))


async def _execute_run(pipeline: Pipeline, run: PipelineRun) -> None:
    async with AsyncSessionLocal() as db:
        try:
            await update_pipeline_run(
                db,
                run.id,
                status="running",
                started_at=datetime.now(timezone.utc),
            )

            creds = (
                decrypt_credentials(
                    pipeline.source_connection.credentials
                )
                if pipeline.source_connection.credentials
                else {}
            )
            connector = get_connector(
                pipeline.source_connection.connector_type,
                pipeline.source_connection.config,
                creds,
            )

            df = await connector.extract(pipeline.extraction_config or {})
            rows_extracted = len(df)

            df = apply_transforms(df, pipeline.transform_config)

            rows_loaded = load_to_database(df, pipeline.load_config)

            await update_pipeline_run(
                db,
                run.id,
                status="completed",
                completed_at=datetime.now(timezone.utc),
                rows_extracted=rows_extracted,
                rows_loaded=rows_loaded,
            )

        except Exception as e:
            await update_pipeline_run(
                db,
                run.id,
                status="failed",
                completed_at=datetime.now(timezone.utc),
                error_message=str(e),
            )
