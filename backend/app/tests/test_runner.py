import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.runner import trigger_run


@pytest.mark.asyncio
@patch("app.orchestration.flows.run_etl_pipeline")
async def test_trigger_run_calls_flow(mock_flow):
    mock_flow.return_value = AsyncMock()()

    pipeline = MagicMock()
    pipeline.id = uuid.uuid4()

    run = MagicMock()
    run.id = uuid.uuid4()

    await trigger_run(pipeline, run)

    import asyncio

    await asyncio.sleep(0.01)
