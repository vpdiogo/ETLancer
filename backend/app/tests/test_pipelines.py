import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_pipeline(client: AsyncClient):
    conn_response = await client.post(
        "/api/v1/connections/",
        json={
            "name": "Pipeline Source",
            "connector_type": "rest_api",
            "config": {},
        },
    )
    conn_id = conn_response.json()["id"]

    payload = {
        "name": "Test Pipeline",
        "description": "A test ETL pipeline",
        "source_connection_id": conn_id,
        "extraction_config": {"endpoint": "/users"},
        "load_config": {"target_table": "users", "if_exists": "replace"},
    }
    response = await client.post("/api/v1/pipelines/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Pipeline"
    assert data["source_connection_id"] == conn_id


@pytest.mark.asyncio
async def test_list_pipelines(client: AsyncClient):
    conn_response = await client.post(
        "/api/v1/connections/",
        json={"name": "List Source", "connector_type": "csv", "config": {}},
    )
    conn_id = conn_response.json()["id"]

    await client.post(
        "/api/v1/pipelines/",
        json={
            "name": "Pipeline A",
            "source_connection_id": conn_id,
            "load_config": {"target_table": "a"},
        },
    )

    response = await client.get("/api/v1/pipelines/")
    assert response.status_code == 200
    assert len(response.json()) >= 1


@pytest.mark.asyncio
async def test_get_pipeline_not_found(client: AsyncClient):
    response = await client.get(
        "/api/v1/pipelines/00000000-0000-0000-0000-000000000000"
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_pipeline(client: AsyncClient):
    conn_response = await client.post(
        "/api/v1/connections/",
        json={"name": "Del Source", "connector_type": "csv", "config": {}},
    )
    conn_id = conn_response.json()["id"]

    pipeline_response = await client.post(
        "/api/v1/pipelines/",
        json={
            "name": "Delete Pipeline",
            "source_connection_id": conn_id,
            "load_config": {"target_table": "del"},
        },
    )
    pipeline_id = pipeline_response.json()["id"]

    response = await client.delete(f"/api/v1/pipelines/{pipeline_id}")
    assert response.status_code == 204
