import pytest
from unittest.mock import MagicMock, AsyncMock
from fastapi import status
from FastAPI.main import app
from FastAPI.database import db

@pytest.mark.asyncio
async def test_get_me_success(client, mock_user_token):
    """Test getting current user info successfully"""
    # Mock database response
    mock_user = {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "username": "testuser",
        "email": "test@example.com",
        "created_at": "2023-01-01T00:00:00"
    }
    
    # Setup mock
    db.fetch_one = AsyncMock(return_value=mock_user)
    
    # Override dependency to simulate logged in user
    app.dependency_overrides = {} # Reset first
    from FastAPI.auth import get_current_user
    app.dependency_overrides[get_current_user] = lambda: {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "test@example.com",
        "username": "testuser"
    }
    
    response = await client.get("/auth/me", headers={"Authorization": f"Bearer {mock_user_token}"})
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_get_me_not_found(client, mock_user_token):
    """Test getting current user info when user is not found in DB"""
    # Setup mock to return None
    db.fetch_one = AsyncMock(return_value=None)
    
    # Override dependency
    from FastAPI.auth import get_current_user
    app.dependency_overrides[get_current_user] = lambda: {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "test@example.com",
        "username": "testuser"
    }
    
    response = await client.get("/auth/me", headers={"Authorization": f"Bearer {mock_user_token}"})
    
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.asyncio
async def test_update_user_success(client, mock_user_token):
    """Test updating user profile successfully"""
    # Mock database responses
    # 1. Check username/email uniqueness (return None means available)
    # 2. Update user (return updated user)
    
    updated_user = {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "username": "newusername",
        "email": "new@example.com",
        "created_at": "2023-01-01T00:00:00"
    }
    
    # We need to handle multiple calls to fetch_one
    async def side_effect(query, *args):
        if "SELECT user_id FROM users WHERE username" in query:
            return None # Username available
        if "SELECT user_id FROM users WHERE email" in query:
            return None # Email available
        if "UPDATE users" in query:
            return updated_user
        return None

    db.fetch_one = AsyncMock(side_effect=side_effect)
    
    # Override dependency
    from FastAPI.auth import get_current_user
    app.dependency_overrides[get_current_user] = lambda: {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "test@example.com",
        "username": "testuser"
    }
    
    payload = {
        "username": "newusername",
        "email": "new@example.com"
    }
    
    response = await client.patch("/auth/me", json=payload, headers={"Authorization": f"Bearer {mock_user_token}"})
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["username"] == "newusername"
    assert data["email"] == "new@example.com"

@pytest.mark.asyncio
async def test_update_user_username_taken(client, mock_user_token):
    """Test updating user with taken username"""
    # Mock database to return existing user for username check
    async def side_effect(query, *args):
        if "SELECT user_id FROM users WHERE username" in query:
            return {"user_id": "other-user-id"}
        return None

    db.fetch_one = AsyncMock(side_effect=side_effect)
    
    # Override dependency
    from FastAPI.auth import get_current_user
    app.dependency_overrides[get_current_user] = lambda: {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "test@example.com",
        "username": "testuser"
    }
    
    payload = {"username": "takenusername"}
    
    response = await client.patch("/auth/me", json=payload, headers={"Authorization": f"Bearer {mock_user_token}"})
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Username already taken" in response.json()["detail"]

@pytest.mark.asyncio
async def test_update_password_success(client, mock_user_token):
    """Test updating password successfully"""
    # Mock database
    # 1. Verify current password (fetch hash)
    # 2. Update user
    
    mock_user_with_hash = {
        "password_hash": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxwKc.6qV.M.h.x.x.x" # Mock hash
    }
    
    updated_user = {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "username": "testuser",
        "email": "test@example.com",
        "created_at": "2023-01-01T00:00:00"
    }

    async def side_effect(query, *args):
        if "SELECT password_hash" in query:
            return mock_user_with_hash
        if "UPDATE users" in query:
            return updated_user
        return None

    db.fetch_one = AsyncMock(side_effect=side_effect)
    
    # Mock verify_password to return True
    with pytest.MonkeyPatch.context() as m:
        m.setattr("FastAPI.users.verify_password", lambda p, h: True)
        m.setattr("FastAPI.users.hash_password", lambda p: "new_hashed_password")
        
        # Override dependency
        from FastAPI.auth import get_current_user
        app.dependency_overrides[get_current_user] = lambda: {
            "user_id": "123e4567-e89b-12d3-a456-426614174000",
            "email": "test@example.com",
            "username": "testuser"
        }
        
        payload = {
            "current_password": "oldpassword",
            "new_password": "newpassword"
        }
        
        response = await client.patch("/auth/me", json=payload, headers={"Authorization": f"Bearer {mock_user_token}"})
        
        assert response.status_code == status.HTTP_200_OK

@pytest.mark.asyncio
async def test_update_password_incorrect_current(client, mock_user_token):
    """Test updating password with incorrect current password"""
    mock_user_with_hash = {
        "password_hash": "somehash"
    }
    
    db.fetch_one = AsyncMock(return_value=mock_user_with_hash)
    
    # Mock verify_password to return False
    with pytest.MonkeyPatch.context() as m:
        m.setattr("FastAPI.users.verify_password", lambda p, h: False)
        
        # Override dependency
        from FastAPI.auth import get_current_user
        app.dependency_overrides[get_current_user] = lambda: {
            "user_id": "123e4567-e89b-12d3-a456-426614174000",
            "email": "test@example.com",
            "username": "testuser"
        }
        
        payload = {
            "current_password": "wrongpassword",
            "new_password": "newpassword"
        }
        
        response = await client.patch("/auth/me", json=payload, headers={"Authorization": f"Bearer {mock_user_token}"})
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Current password is incorrect" in response.json()["detail"]

@pytest.mark.asyncio
async def test_update_password_missing_current(client, mock_user_token):
    """Test updating password without providing current password"""
    # Override dependency
    from FastAPI.auth import get_current_user
    app.dependency_overrides[get_current_user] = lambda: {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "test@example.com",
        "username": "testuser"
    }
    
    payload = {
        "new_password": "newpassword"
    }
    
    response = await client.patch("/auth/me", json=payload, headers={"Authorization": f"Bearer {mock_user_token}"})
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Current password is required" in response.json()["detail"]

@pytest.mark.asyncio
async def test_update_no_fields(client, mock_user_token):
    """Test updating with no fields"""
    # Override dependency
    from FastAPI.auth import get_current_user
    app.dependency_overrides[get_current_user] = lambda: {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "test@example.com",
        "username": "testuser"
    }
    
    payload = {}
    
    response = await client.patch("/auth/me", json=payload, headers={"Authorization": f"Bearer {mock_user_token}"})
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "No fields to update" in response.json()["detail"]
