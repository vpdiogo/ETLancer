import uuid
from datetime import datetime, timezone

from prefect import flow, get_run_logger
from prefect.runtime import flow_run
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import AsyncSessionLocal
from app.core.encryption import decrypt_credentials
from app.crud.pipeline_run import update_pipeline_run
from app.models.pipeline import Pipeline
from app.orchestration.tasks import (
    extract_data,
    load_data,
    transform_data,
)


@flow(name="etl_pipeline_flow")
async def run_etl_pipeline(pipeline_id: str, run_id: str) -> None:
    logger = get_run_logger()
    pid = uuid.UUID(pipeline_id)
    rid = uuid.UUID(run_id)

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Pipeline)
            .where(Pipeline.id == pid)
            .options(selectinload(Pipeline.source_connection))
        )
        pipeline = result.scalar_one_or_none()
        if not pipeline:
            raise ValueError(f"Pipeline {pipeline_id} not found")

        connector_type = pipeline.source_connection.connector_type
        config = pipeline.source_connection.config
        credentials_raw = pipeline.source_connection.credentials
        extraction_config = pipeline.extraction_config or {}
        transform_config = pipeline.transform_config
        load_config = pipeline.load_config
        pipeline_name = pipeline.name

        prefect_run_id = flow_run.id
        await update_pipeline_run(
            db,
            rid,
            status="running",
            started_at=datetime.now(timezone.utc),
            prefect_flow_run_id=str(prefect_run_id) if prefect_run_id else None,
        )

    try:
        logger.info(f"Starting ETL for pipeline: {pipeline_name}")

        creds = decrypt_credentials(credentials_raw) if credentials_raw else {}

        df = await extract_data(
            connector_type=connector_type,
            config=config,
            credentials=creds,
            extraction_config=extraction_config,
        )
        rows_extracted = len(df)
        logger.info(f"Extracted {rows_extracted} rows")

        df = transform_data(df, transform_config)
        logger.info(f"Transformed data: {len(df)} rows")

        rows_loaded = load_data(df, load_config)
        logger.info(f"Loaded {rows_loaded} rows")

        async with AsyncSessionLocal() as db:
            await update_pipeline_run(
                db,
                rid,
                status="completed",
                completed_at=datetime.now(timezone.utc),
                rows_extracted=rows_extracted,
                rows_loaded=rows_loaded,
            )

    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        async with AsyncSessionLocal() as db:
            await update_pipeline_run(
                db,
                rid,
                status="failed",
                completed_at=datetime.now(timezone.utc),
                error_message=str(e),
            )
        raise
