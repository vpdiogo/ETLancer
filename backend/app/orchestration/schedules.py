"""Prefect deployment management for scheduled pipelines.

This module handles creating, updating, and removing Prefect deployments
for pipelines that have a cron schedule defined.
"""

from prefect.client.orchestration import get_client


async def create_deployment(pipeline_id: str, pipeline_name: str, schedule: str) -> str:
    """Create a Prefect deployment for a scheduled pipeline.

    Returns the deployment ID.
    """
    from app.orchestration.flows import run_etl_pipeline

    deployment_id = await run_etl_pipeline.to_deployment(
        name=f"etl-{pipeline_name}",
        cron=schedule,
        parameters={"pipeline_id": pipeline_id, "run_id": ""},
        tags=["etlancer", "scheduled"],
    )
    return str(deployment_id)


async def delete_deployment(deployment_name: str) -> None:
    """Remove a Prefect deployment."""
    async with get_client() as client:
        deployment = await client.read_deployment_by_name(
            f"etl-pipeline-flow/{deployment_name}"
        )
        if deployment:
            await client.delete_deployment(deployment.id)
