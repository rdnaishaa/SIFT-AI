import pytest
from fastapi import status
from FastAPI.auth import hash_password

@pytest.mark.asyncio
async def test_register_success(client, mock_db):
    # Setup mock
    # fetch_one is called 3 times:
    # 1. Check email -> None
    # 2. Check username -> None
    # 3. Insert -> Returns new user dict
    
    new_user = {
        "user_id": "new-user-uuid",
        "username": "testuser",
        "email": "test@example.com",
        "created_at": "2023-01-01T00:00:00"
    }
    
    mock_db.fetch_one.side_effect = [None, None, new_user]
    
    payload = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    }
    
    response = await client.post("/auth/register", json=payload)
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == payload["email"]

@pytest.mark.asyncio
async def test_register_duplicate_email(client, mock_db):
    # Setup mock to return an existing user when checking email
    mock_db.fetch_one.return_value = {"user_id": "existing-id"}
    
    payload = {
        "username": "newuser",
        "email": "existing@example.com",
        "password": "password123"
    }
    
    response = await client.post("/auth/register", json=payload)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "Email already registered"

@pytest.mark.asyncio
async def test_register_duplicate_username(client, mock_db):
    # First call (email check) returns None
    # Second call (username check) returns existing user
    mock_db.fetch_one.side_effect = [None, {"user_id": "existing-id"}]
    
    payload = {
        "username": "existinguser",
        "email": "new@example.com",
        "password": "password123"
    }
    
    response = await client.post("/auth/register", json=payload)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json()["detail"] == "Username already taken"

@pytest.mark.asyncio
async def test_login_success(client, mock_db):
    # Setup mock user
    hashed_pw = hash_password("password123")
    mock_user = {
        "user_id": "user-uuid",
        "username": "testuser",
        "email": "test@example.com",
        "password_hash": hashed_pw,
        "created_at": "2023-01-01T00:00:00"
    }
    
    # Reset side_effect from previous tests if any
    mock_db.fetch_one.side_effect = None
    mock_db.fetch_one.return_value = mock_user
    
    payload = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    response = await client.post("/auth/login", json=payload)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == payload["email"]

@pytest.mark.asyncio
async def test_login_wrong_password(client, mock_db):
    # Setup mock user
    hashed_pw = hash_password("correctpassword")
    mock_user = {
        "user_id": "user-uuid",
        "username": "testuser",
        "email": "test@example.com",
        "password_hash": hashed_pw,
        "created_at": "2023-01-01T00:00:00"
    }
    
    mock_db.fetch_one.side_effect = None
    mock_db.fetch_one.return_value = mock_user
    
    payload = {
        "email": "test@example.com",
        "password": "wrongpassword"
    }
    
    response = await client.post("/auth/login", json=payload)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Invalid email or password"

@pytest.mark.asyncio
async def test_login_user_not_found(client, mock_db):
    # Setup mock to return None
    mock_db.fetch_one.side_effect = None
    mock_db.fetch_one.return_value = None
    
    payload = {
        "email": "nonexistent@example.com",
        "password": "password123"
    }
    
    response = await client.post("/auth/login", json=payload)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Invalid email or password"

from datetime import timedelta
from FastAPI.auth import create_access_token, decode_access_token, verify_token
from fastapi import HTTPException

def test_token_expiration():
    data = {"sub": "test"}
    # Create token that expires immediately
    token = create_access_token(data, expires_delta=timedelta(seconds=-1))
    
    with pytest.raises(HTTPException) as exc:
        decode_access_token(token)
    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED

def test_invalid_token():
    with pytest.raises(HTTPException) as exc:
        decode_access_token("invalid-token")
    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.asyncio
async def test_verify_token_success():
    data = {"user_id": "uid", "email": "test@example.com", "username": "user"}
    token = create_access_token(data)
    
    user = await verify_token(token)
    assert user["user_id"] == "uid"
    assert user["email"] == "test@example.com"

@pytest.mark.asyncio
async def test_verify_token_missing_fields():
    data = {"sub": "test"} # Missing user_id and email
    token = create_access_token(data)
    
    with pytest.raises(HTTPException) as exc:
        await verify_token(token)
    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED

