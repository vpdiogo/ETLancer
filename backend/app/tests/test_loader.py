from unittest.mock import MagicMock, patch

import pandas as pd
import pytest

from app.services.loader import load_to_database


@pytest.fixture
def sample_df():
    return pd.DataFrame(
        {"id": [1, 2, 3], "value": ["a", "b", "c"]}
    )


@patch("app.services.loader.create_engine")
def test_load_defaults(mock_create_engine, sample_df):
    mock_engine = MagicMock()
    mock_create_engine.return_value = mock_engine

    with patch.object(
        pd.DataFrame, "to_sql", return_value=3
    ) as mock_to_sql:
        result = load_to_database(
            sample_df, {"target_table": "test_table"}
        )

    mock_to_sql.assert_called_once_with(
        name="test_table",
        con=mock_engine,
        if_exists="replace",
        schema="public",
        index=False,
    )
    mock_engine.dispose.assert_called_once()
    assert result == 3


@patch("app.services.loader.create_engine")
def test_load_append_mode(mock_create_engine, sample_df):
    mock_engine = MagicMock()
    mock_create_engine.return_value = mock_engine

    with patch.object(
        pd.DataFrame, "to_sql", return_value=3
    ):
        result = load_to_database(
            sample_df,
            {
                "target_table": "test_table",
                "if_exists": "append",
                "schema": "staging",
            },
        )

    assert result == 3


@patch("app.services.loader.create_engine")
def test_load_returns_len_when_none(
    mock_create_engine, sample_df
):
    mock_engine = MagicMock()
    mock_create_engine.return_value = mock_engine

    with patch.object(
        pd.DataFrame, "to_sql", return_value=None
    ):
        result = load_to_database(
            sample_df, {"target_table": "test_table"}
        )

    assert result == 3


def test_load_missing_target_table(sample_df):
    with pytest.raises(KeyError):
        load_to_database(sample_df, {})
