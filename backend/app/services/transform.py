import pandas as pd


def apply_transforms(df: pd.DataFrame, transform_config: list[dict] | None) -> pd.DataFrame:
    """Apply a list of transform steps sequentially to a DataFrame."""
    if not transform_config:
        return df

    for step in transform_config:
        step_type = step["type"]
        if step_type == "rename":
            df = df.rename(columns=step["mapping"])
        elif step_type == "filter":
            column = step["column"]
            operator = step["operator"]
            value = step["value"]
            df = _apply_filter(df, column, operator, value)
        elif step_type == "cast":
            df[step["column"]] = df[step["column"]].astype(step["to"])
        elif step_type == "drop":
            df = df.drop(columns=step["columns"], errors="ignore")
        else:
            raise ValueError(f"Unknown transform type: {step_type}")

    return df


def _apply_filter(
    df: pd.DataFrame, column: str, operator: str, value
) -> pd.DataFrame:
    ops = {
        "eq": lambda col, v: col == v,
        "ne": lambda col, v: col != v,
        "gt": lambda col, v: col > v,
        "gte": lambda col, v: col >= v,
        "lt": lambda col, v: col < v,
        "lte": lambda col, v: col <= v,
        "contains": lambda col, v: col.str.contains(v, na=False),
    }
    if operator not in ops:
        raise ValueError(f"Unknown filter operator: {operator}")
    mask = ops[operator](df[column], value)
    return df[mask]
