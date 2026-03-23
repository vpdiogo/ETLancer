import re

import pandas as pd
from sqlalchemy import create_engine

from app.core.config import settings

RESERVED_TABLES = {
    "connections",
    "pipelines",
    "pipeline_runs",
    "alembic_version",
}
TABLE_NAME_PATTERN = re.compile(r"^[a-zA-Z_][a-zA-Z0-9_]*$")

_engine = create_engine(settings.DATABASE_URL)


def load_to_database(df: pd.DataFrame, load_config: dict) -> int:
    """Load a DataFrame into PostgreSQL.

    load_config:
        target_table: Name of the destination table
        if_exists: "replace", "append", or "fail" (default: "replace")
        schema: Database schema (default: "public")
    """
    target_table = load_config["target_table"]
    if_exists = load_config.get("if_exists", "replace")
    schema = load_config.get("schema", "public")

    if target_table.lower() in RESERVED_TABLES:
        raise ValueError(f"Cannot write to reserved table: {target_table}")

    if not TABLE_NAME_PATTERN.match(target_table):
        raise ValueError(f"Invalid table name: {target_table}")

    if not TABLE_NAME_PATTERN.match(schema):
        raise ValueError(f"Invalid schema name: {schema}")

    rows = df.to_sql(
        name=target_table,
        con=_engine,
        if_exists=if_exists,
        schema=schema,
        index=False,
    )
    return rows if rows is not None else len(df)
