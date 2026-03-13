import pandas as pd
from sqlalchemy import create_engine

from app.core.config import settings


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

    engine = create_engine(settings.DATABASE_URL)
    rows = df.to_sql(
        name=target_table,
        con=engine,
        if_exists=if_exists,
        schema=schema,
        index=False,
    )
    engine.dispose()
    return rows if rows is not None else len(df)
