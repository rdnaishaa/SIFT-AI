import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from FastAPI.main import app

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c

@pytest.fixture
def mock_db(monkeypatch):
    # Create a mock for the database instance
    mock_database = AsyncMock()
    
    # Mock the connect and disconnect methods
    mock_database.connect = AsyncMock()
    mock_database.disconnect = AsyncMock()
    
    # Replace the real db instance with our mock in the modules where it's used
    # Note: We need to patch it where it is IMPORTED, or the original object if it's imported directly
    monkeypatch.setattr("FastAPI.database.db", mock_database)
    monkeypatch.setattr("FastAPI.users.db", mock_database)
    monkeypatch.setattr("FastAPI.main.db", mock_database)
    monkeypatch.setattr("FastAPI.profiles.db", mock_database)
    
    return mock_database

from FastAPI.auth import create_access_token

@pytest.fixture
def mock_user_token():
    return create_access_token({
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "test@example.com",
        "username": "testuser"
    })

