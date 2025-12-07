import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import FastAPI.intelligence_service
from FastAPI.intelligence_service import generate_company_intelligence

@pytest.mark.asyncio
async def test_generate_company_intelligence_success():
    # Mock data
    company_name = "Test Corp"
    overview = {"industry": "Tech", "location": "Jakarta", "employee_count": "100"}
    tech_stack = ["Python", "React"]
    recent_news = [{"title": "News 1"}]
    key_contacts = [{"name": "John Doe"}]
    
    # Mock Gemini response
    mock_response = MagicMock()
    mock_response.text = """
    {
        "executive_summary": "MOCKED_SUMMARY_UNIQUE_STRING",
        "pain_points": [
            {
                "title": "Scaling Issues",
                "description": "Difficulty scaling infrastructure.",
                "confidence": "High",
                "source": "News 1"
            }
        ],
        "opening_lines": {
            "devops_manager": {
                "role": "DevOps Manager",
                "message": "Hello DevOps",
                "context": "Scaling context"
            },
            "head_of_engineering": {
                "role": "CTO",
                "message": "Hello CTO",
                "context": "Tech context"
            }
        }
    }
    """
    
    # Mock the generative model instance directly
    mock_model_instance = MagicMock() # Use MagicMock instead of AsyncMock for the model itself
    mock_model_instance.generate_content.return_value = mock_response # Mock the sync method
    
    # Patch the 'model' variable in the module using patch.object
    with patch.object(FastAPI.intelligence_service, 'model', mock_model_instance):
        print(f"DEBUG: Model in module is now: {FastAPI.intelligence_service.model}")
        result = await generate_company_intelligence(
            company_name, overview, tech_stack, recent_news, key_contacts
        )
        
        assert result["executive_summary"] == "MOCKED_SUMMARY_UNIQUE_STRING"
        assert len(result["pain_points"]) == 1
        assert result["pain_points"][0]["title"] == "Scaling Issues"
        assert "devops_manager" in result["opening_lines"]

@pytest.mark.asyncio
async def test_generate_company_intelligence_json_error():
    # Mock data
    company_name = "Test Corp"
    overview = {}
    tech_stack = []
    recent_news = []
    key_contacts = []
    
    # Mock Gemini response with invalid JSON
    mock_response = MagicMock()
    mock_response.text = "Invalid JSON response"
    
    mock_model_instance = MagicMock()
    mock_model_instance.generate_content.return_value = mock_response
    
    with patch.object(FastAPI.intelligence_service, 'model', mock_model_instance):
        # Expecting the default fallback response because the code catches exceptions
        result = await generate_company_intelligence(
            company_name, overview, tech_stack, recent_news, key_contacts
        )
        # The code returns a default dict on error, not raising exception
        assert result["executive_summary"] == "Test Corp is a company in the technology industry."
        assert result["pain_points"] == []
