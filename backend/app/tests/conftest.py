import asyncio
import os
from collections.abc import AsyncGenerator

os.environ.setdefault("API_KEY", "test-api-key")
os.environ.setdefault(
    "ENCRYPTION_KEY",
    "cYFNSivrrSI20TZVNxKKJvgJsfx9sDvtAtljDMUAtTc=",
)

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.database import Base, get_db
from app.core.security import verify_api_key
from app.main import app

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session


async def override_verify_api_key() -> str:
    return "test-api-key"


app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[verify_api_key] = override_verify_api_key


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport, base_url="http://test"
    ) as ac:
        yield ac


@pytest.fixture
async def unauthenticated_app():
    """App without auth override for testing real auth."""
    from fastapi.testclient import TestClient

    original = app.dependency_overrides.copy()
    app.dependency_overrides.pop(verify_api_key, None)
    yield app
    app.dependency_overrides = original


@pytest.fixture
async def unauthenticated_client(
    unauthenticated_app,
) -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=unauthenticated_app)
    async with AsyncClient(
        transport=transport, base_url="http://test"
    ) as ac:
        yield ac
