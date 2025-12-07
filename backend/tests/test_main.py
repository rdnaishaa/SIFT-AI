import pytest
from fastapi import status
from unittest.mock import patch, AsyncMock

@pytest.mark.asyncio
async def test_read_root(client):
    response = await client.get("/")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"message": "SIFT API is running. Go to /docs for API documentation."}

@pytest.mark.asyncio
async def test_generate_profile_endpoint_success(client):
    mock_profile_data = {
        "company_name": "Test Company",
        "overview": {"industry": "Tech"},
        "tech_stack": ["Python"],
        "recent_news_signals": [],
        "key_contacts": []
    }
    
    # Mock run_sift_agent
    with patch("FastAPI.main.run_sift_agent", new_callable=AsyncMock) as mock_agent:
        mock_agent.return_value = mock_profile_data
        
        payload = {"company_name": "Test Company"}
        response = await client.post("/generate-profile", json=payload)
        
        assert response.status_code == status.HTTP_200_OK
        # The response model is CompanyProfile, so it will be serialized
        # We check specific fields to avoid issues with default values
        data = response.json()
        assert data["company_name"] == "Test Company"
        assert data["overview"]["industry"] == "Tech"
        assert data["tech_stack"] == ["Python"]

@pytest.mark.asyncio
async def test_generate_profile_endpoint_error(client):
    # Mock run_sift_agent to raise exception
    with patch("FastAPI.main.run_sift_agent", side_effect=Exception("Agent failed")):
        payload = {"company_name": "Test Company"}
        response = await client.post("/generate-profile", json=payload)
        
        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "An unexpected internal server error occurred" in response.json()["detail"]
