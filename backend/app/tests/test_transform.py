import pandas as pd
import pytest

from app.services.transform import apply_transforms


@pytest.fixture
def sample_df():
    return pd.DataFrame(
        {
            "name": ["Alice", "Bob", "Charlie"],
            "age": [30, 25, 35],
            "city": ["SP", "RJ", "BH"],
        }
    )


def test_none_config(sample_df):
    result = apply_transforms(sample_df, None)
    pd.testing.assert_frame_equal(result, sample_df)


def test_empty_list(sample_df):
    result = apply_transforms(sample_df, [])
    pd.testing.assert_frame_equal(result, sample_df)


def test_rename_columns(sample_df):
    config = [
        {"type": "rename", "mapping": {"name": "full_name"}}
    ]
    result = apply_transforms(sample_df, config)
    assert "full_name" in result.columns
    assert "name" not in result.columns


def test_filter_eq(sample_df):
    config = [
        {
            "type": "filter",
            "column": "city",
            "operator": "eq",
            "value": "SP",
        }
    ]
    result = apply_transforms(sample_df, config)
    assert len(result) == 1
    assert result.iloc[0]["name"] == "Alice"


def test_filter_gt(sample_df):
    config = [
        {
            "type": "filter",
            "column": "age",
            "operator": "gt",
            "value": 28,
        }
    ]
    result = apply_transforms(sample_df, config)
    assert len(result) == 2
    assert set(result["name"]) == {"Alice", "Charlie"}


def test_filter_contains(sample_df):
    config = [
        {
            "type": "filter",
            "column": "name",
            "operator": "contains",
            "value": "li",
        }
    ]
    result = apply_transforms(sample_df, config)
    assert len(result) == 2
    assert set(result["name"]) == {"Alice", "Charlie"}


def test_cast_column(sample_df):
    config = [{"type": "cast", "column": "age", "to": "float"}]
    result = apply_transforms(sample_df, config)
    assert result["age"].dtype == float


def test_drop_columns(sample_df):
    config = [{"type": "drop", "columns": ["city", "nonexistent"]}]
    result = apply_transforms(sample_df, config)
    assert "city" not in result.columns
    assert "name" in result.columns


def test_chained_transforms(sample_df):
    config = [
        {
            "type": "filter",
            "column": "age",
            "operator": "gte",
            "value": 30,
        },
        {"type": "rename", "mapping": {"name": "person"}},
        {"type": "drop", "columns": ["city"]},
    ]
    result = apply_transforms(sample_df, config)
    assert len(result) == 2
    assert "person" in result.columns
    assert "city" not in result.columns


def test_unknown_transform_type(sample_df):
    config = [{"type": "pivot"}]
    with pytest.raises(ValueError, match="Unknown transform type"):
        apply_transforms(sample_df, config)


def test_unknown_filter_operator(sample_df):
    config = [
        {
            "type": "filter",
            "column": "age",
            "operator": "between",
            "value": 30,
        }
    ]
    with pytest.raises(ValueError, match="Unknown filter operator"):
        apply_transforms(sample_df, config)
