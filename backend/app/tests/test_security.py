import pytest
from httpx import ASGITransport, AsyncClient


@pytest.mark.asyncio
async def test_no_auth_returns_403(unauthenticated_client: AsyncClient):
    response = await unauthenticated_client.get("/api/v1/connections/")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_wrong_key_returns_401(unauthenticated_client: AsyncClient):
    response = await unauthenticated_client.get(
        "/api/v1/connections/",
        headers={"Authorization": "Bearer wrong-key"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_valid_key_succeeds(unauthenticated_client: AsyncClient):
    response = await unauthenticated_client.get(
        "/api/v1/connections/",
        headers={"Authorization": "Bearer test-api-key"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_health_check_is_public(unauthenticated_client: AsyncClient):
    response = await unauthenticated_client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "running"
