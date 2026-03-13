import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_connection(client: AsyncClient):
    payload = {
        "name": "Test API",
        "connector_type": "rest_api",
        "config": {"base_url": "https://api.example.com"},
        "description": "A test connection",
    }
    response = await client.post("/api/v1/connections/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test API"
    assert data["connector_type"] == "rest_api"
    assert data["config"]["base_url"] == "https://api.example.com"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_connections(client: AsyncClient):
    # Create two connections
    await client.post(
        "/api/v1/connections/",
        json={"name": "Conn 1", "connector_type": "csv", "config": {}},
    )
    await client.post(
        "/api/v1/connections/",
        json={"name": "Conn 2", "connector_type": "rest_api", "config": {}},
    )

    response = await client.get("/api/v1/connections/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


@pytest.mark.asyncio
async def test_get_connection(client: AsyncClient):
    create_response = await client.post(
        "/api/v1/connections/",
        json={"name": "Get Test", "connector_type": "csv", "config": {}},
    )
    conn_id = create_response.json()["id"]

    response = await client.get(f"/api/v1/connections/{conn_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Get Test"


@pytest.mark.asyncio
async def test_get_connection_not_found(client: AsyncClient):
    response = await client.get(
        "/api/v1/connections/00000000-0000-0000-0000-000000000000"
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_connection(client: AsyncClient):
    create_response = await client.post(
        "/api/v1/connections/",
        json={"name": "Update Me", "connector_type": "csv", "config": {}},
    )
    conn_id = create_response.json()["id"]

    response = await client.put(
        f"/api/v1/connections/{conn_id}",
        json={"name": "Updated Name"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"


@pytest.mark.asyncio
async def test_delete_connection(client: AsyncClient):
    create_response = await client.post(
        "/api/v1/connections/",
        json={"name": "Delete Me", "connector_type": "csv", "config": {}},
    )
    conn_id = create_response.json()["id"]

    response = await client.delete(f"/api/v1/connections/{conn_id}")
    assert response.status_code == 204

    get_response = await client.get(f"/api/v1/connections/{conn_id}")
    assert get_response.status_code == 404
