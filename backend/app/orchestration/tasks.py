import pandas as pd
from prefect import task

from app.connectors.registry import get_connector
from app.services.loader import load_to_database
from app.services.transform import apply_transforms


@task(name="extract_data", retries=2, retry_delay_seconds=30)
async def extract_data(
    connector_type: str,
    config: dict,
    credentials: dict | None,
    extraction_config: dict,
) -> pd.DataFrame:
    """Extract data from a source using the appropriate connector."""
    connector = get_connector(connector_type, config, credentials)
    return await connector.extract(extraction_config)


@task(name="transform_data")
def transform_data(
    df: pd.DataFrame, transform_config: list[dict] | None
) -> pd.DataFrame:
    """Apply transformations to the extracted data."""
    return apply_transforms(df, transform_config)


@task(name="load_data")
def load_data(df: pd.DataFrame, load_config: dict) -> int:
    """Load transformed data into the destination."""
    return load_to_database(df, load_config)
