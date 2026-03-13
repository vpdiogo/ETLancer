import uuid
from datetime import datetime, timezone

from prefect import flow, get_run_logger

from app.core.database import AsyncSessionLocal
from app.crud.pipeline import get_pipeline
from app.crud.pipeline_run import update_pipeline_run
from app.orchestration.tasks import extract_data, load_data, transform_data


@flow(name="etl_pipeline_flow")
async def run_etl_pipeline(pipeline_id: str, run_id: str) -> None:
    """Execute a full ETL pipeline: extract -> transform -> load."""
    logger = get_run_logger()
    pid = uuid.UUID(pipeline_id)
    rid = uuid.UUID(run_id)

    async with AsyncSessionLocal() as db:
        pipeline = await get_pipeline(db, pid)
        if not pipeline:
            raise ValueError(f"Pipeline {pipeline_id} not found")

        await update_pipeline_run(
            db,
            rid,
            status="running",
            started_at=datetime.now(timezone.utc),
        )

    try:
        logger.info(f"Starting ETL for pipeline: {pipeline.name}")

        # Extract
        df = await extract_data(
            connector_type=pipeline.source_connection.connector_type,
            config=pipeline.source_connection.config,
            credentials=pipeline.source_connection.credentials,
            extraction_config=pipeline.extraction_config or {},
        )
        rows_extracted = len(df)
        logger.info(f"Extracted {rows_extracted} rows")

        # Transform
        df = transform_data(df, pipeline.transform_config)
        logger.info(f"Transformed data: {len(df)} rows")

        # Load
        rows_loaded = load_data(df, pipeline.load_config)
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
