import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import status
from FastAPI.profiles import process_profile_background
from FastAPI.main import app
from FastAPI.auth import get_current_user

# Mock user for dependency override
async def mock_get_current_user():
    return {
        "user_id": "user-uuid",
        "email": "test@example.com",
        "username": "testuser"
    }

@pytest.fixture
def override_auth():
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield
    app.dependency_overrides = {}

@pytest.mark.asyncio
async def test_create_profile_success(client, mock_db, override_auth):
    # Mock DB insert
    mock_db.fetch_one.return_value = {
        "profile_id": "new-profile-uuid",
        "user_id": "user-uuid",
        "company_name": "Test Company",
        "status": "processing",
        "created_at": "2023-01-01T00:00:00"
    }
    
    # Mock background task
    with patch("FastAPI.profiles.process_profile_background") as mock_bg_task:
        payload = {"company_name": "Test Company"}
        response = await client.post("/profiles/create", json=payload, headers={"Authorization": "Bearer token"})
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["profile_id"] == "new-profile-uuid"
        assert data["status"] == "processing"

@pytest.mark.asyncio
async def test_get_profiles_list(client, mock_db, override_auth):
    # Mock DB response
    mock_profiles = [
        {
            "profile_id": "p1",
            "user_id": "user-uuid",
            "company_name": "Company A",
            "status": "completed",
            "created_at": "2023-01-01T00:00:00",
            "error_message": None,
            "overview": None,
            "tech_stack": None,
            "recent_news_signals": None,
            "key_contacts": None,
            "executive_summary": None,
            "pain_points": None,
            "opening_lines": None,
            "data_sources": None,
            "last_analyzed_at": None,
            "is_favorite": False
        },
        {
            "profile_id": "p2",
            "user_id": "user-uuid",
            "company_name": "Company B",
            "status": "processing",
            "created_at": "2023-01-02T00:00:00",
            "error_message": None,
            "overview": None,
            "tech_stack": None,
            "recent_news_signals": None,
            "key_contacts": None,
            "executive_summary": None,
            "pain_points": None,
            "opening_lines": None,
            "data_sources": None,
            "last_analyzed_at": None,
            "is_favorite": False
        }
    ]
    mock_db.fetch_all.return_value = mock_profiles
    
    response = await client.get("/profiles/my-profiles", headers={"Authorization": "Bearer token"})
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2
    assert data[0]["company_name"] == "Company A"

@pytest.mark.asyncio
async def test_get_profile_detail_success(client, mock_db, override_auth):
    mock_profile = {
        "profile_id": "p1",
        "user_id": "user-uuid",
        "company_name": "Company A",
        "status": "completed",
        "overview": '{"industry": "Tech"}',
        "tech_stack": '["Python", "React"]',
        "recent_news_signals": '[]',
        "key_contacts": '[]',
        "pain_points": '[]',
        "opening_lines": '{}',
        "data_sources": '[]',
        "created_at": "2023-01-01T00:00:00",
        "error_message": None,
        "executive_summary": None,
        "last_analyzed_at": None,
        "is_favorite": False
    }
    mock_db.fetch_one.return_value = mock_profile
    
    response = await client.get("/profiles/p1", headers={"Authorization": "Bearer token"})
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["company_name"] == "Company A"
    assert data["overview"]["industry"] == "Tech"

@pytest.mark.asyncio
async def test_get_profile_detail_not_found(client, mock_db, override_auth):
    mock_db.fetch_one.return_value = None
    
    response = await client.get("/profiles/nonexistent", headers={"Authorization": "Bearer token"})
    
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.asyncio
async def test_process_profile_background(mock_db):
    # Mock dependencies
    mock_profile_data = MagicMock()
    mock_profile_data.overview.dict.return_value = {"industry": "Tech"}
    mock_profile_data.tech_stack = ["Python"]
    mock_profile_data.recent_news_signals = []
    mock_profile_data.key_contacts = []
    
    mock_intelligence = {
        "executive_summary": "Summary",
        "pain_points": [],
        "opening_lines": {}
    }
    
    with patch("FastAPI.profiles.run_sift_agent", new_callable=AsyncMock) as mock_agent:
        mock_agent.return_value = mock_profile_data
        
        with patch("FastAPI.profiles.enrich_profile_with_intelligence", new_callable=AsyncMock) as mock_enrich:
            mock_enrich.return_value = mock_intelligence
            
            await process_profile_background("p1", "Test Company")
            
            # Verify DB update was called
            assert mock_db.execute.called
            # Verify status update to completed
            args = mock_db.execute.call_args[0]
            assert "UPDATE company_profiles" in args[0]
            assert "completed" in args[0]

@pytest.mark.asyncio
async def test_process_profile_background_failure(mock_db):
    # Simulate error in agent
    with patch("FastAPI.profiles.run_sift_agent", side_effect=Exception("Agent failed")):
        await process_profile_background("p1", "Test Company")
        
        # Verify DB delete was called (cleanup on failure)
        assert mock_db.execute.called
        args = mock_db.execute.call_args[0]
        assert "DELETE FROM company_profiles" in args[0]

@pytest.mark.asyncio
async def test_delete_profile_success(client, mock_db, override_auth):
    # Mock existence check
    mock_db.fetch_one.return_value = {"profile_id": "p1"}
    
    response = await client.delete("/profiles/p1", headers={"Authorization": "Bearer token"})
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
    # Verify delete was called
    assert mock_db.execute.called

@pytest.mark.asyncio
async def test_delete_profile_not_found(client, mock_db, override_auth):
    # Mock existence check returning None
    mock_db.fetch_one.return_value = None
    
    response = await client.delete("/profiles/p1", headers={"Authorization": "Bearer token"})
    
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.asyncio
async def test_toggle_favorite_success(client, mock_db, override_auth):
    # Mock existence check
    mock_db.fetch_one.side_effect = [
        {"is_favorite": False}, # First call: check existence
        { # Second call: return updated profile
            "profile_id": "p1",
            "user_id": "user-uuid",
            "company_name": "Company A",
            "status": "completed",
            "error_message": None,
            "overview": None,
            "tech_stack": None,
            "recent_news_signals": None,
            "key_contacts": None,
            "executive_summary": None,
            "pain_points": None,
            "opening_lines": None,
            "data_sources": None,
            "last_analyzed_at": None,
            "is_favorite": True,
            "created_at": "2023-01-01T00:00:00"
        }
    ]
    
    response = await client.patch("/profiles/p1/favorite", headers={"Authorization": "Bearer token"})
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["is_favorite"] is True

@pytest.mark.asyncio
async def test_toggle_favorite_not_found(client, mock_db, override_auth):
    # Mock existence check returning None
    mock_db.fetch_one.return_value = None
    
    response = await client.patch("/profiles/p1/favorite", headers={"Authorization": "Bearer token"})
    
    assert response.status_code == status.HTTP_404_NOT_FOUND

@pytest.mark.asyncio
async def test_create_profile_stream_success(client, mock_db):
    # Mock verify_token
    with patch("FastAPI.profiles.verify_token", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = {"user_id": "user-uuid", "email": "test@example.com"}
        
        # Mock streaming agent
        async def mock_streaming(company_name):
            yield "Log 1"
            yield "Log 2"
        
        # Mock final agent result
        mock_profile_data = MagicMock()
        mock_profile_data.overview.dict.return_value = {"industry": "Tech"}
        mock_profile_data.tech_stack = ["Python"]
        mock_profile_data.recent_news_signals = []
        mock_profile_data.key_contacts = []
        
        # Mock intelligence
        mock_intelligence = {
            "executive_summary": "Summary",
            "pain_points": [],
            "opening_lines": {}
        }
        
        # Mock DB insert
        mock_db.fetch_one.return_value = {"profile_id": "new-profile-id"}
        
        with patch("FastAPI.profiles.run_sift_agent_with_streaming", side_effect=mock_streaming), \
             patch("FastAPI.profiles.run_sift_agent", new_callable=AsyncMock) as mock_agent, \
             patch("FastAPI.profiles.enrich_profile_with_intelligence", new_callable=AsyncMock) as mock_enrich:
            
            mock_agent.return_value = mock_profile_data
            mock_enrich.return_value = mock_intelligence
            
            # Use httpx to stream response
            async with client.stream("GET", "/profiles/create-stream?company_name=Test&token=valid-token") as response:
                assert response.status_code == status.HTTP_200_OK
                
                # Collect chunks
                chunks = []
                async for chunk in response.aiter_text():
                    chunks.append(chunk)
                
                full_response = "".join(chunks)
                assert "data: Log 1" in full_response
                assert "data: DONE|new-profile-id" in full_response

@pytest.mark.asyncio
async def test_create_profile_stream_unauthorized(client):
    # Mock verify_token to raise exception
    with patch("FastAPI.profiles.verify_token", side_effect=Exception("Invalid token")):
        async with client.stream("GET", "/profiles/create-stream?company_name=Test&token=invalid") as response:
            assert response.status_code == status.HTTP_200_OK # SSE returns 200 but streams error
            
            chunks = []
            async for chunk in response.aiter_text():
                chunks.append(chunk)
            
            full_response = "".join(chunks)
            assert "data: ERROR|Unauthorized" in full_response


