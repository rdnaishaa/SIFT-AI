"""
Service untuk generate AI intelligence dari company data
"""
import os
import json
from typing import List, Dict
import google.generativeai as genai
from dotenv import load_dotenv
from .intelligence_models import PainPoint, CompanyIntelligence

load_dotenv()

# Initialize Gemini client
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')  

async def generate_company_intelligence(
    company_name: str,
    overview: dict,
    tech_stack: List[str],
    recent_news: List[dict],
    key_contacts: List[dict]
) -> dict:
    """
    Generate AI intelligence dari scraped data
    
    Returns dict dengan:
    - executive_summary
    - pain_points
    - opening_lines
    """
    
    # Prepare context untuk LLM
    context = f"""
COMPANY: {company_name}

OVERVIEW:
- Industry: {overview.get('industry', 'N/A')}
- Location: {overview.get('location', 'N/A')}
- Employee Count: {overview.get('employee_count', 'N/A')}

TECH STACK:
{', '.join(tech_stack) if tech_stack else 'No tech stack data available'}

RECENT NEWS/SIGNALS:
{json.dumps(recent_news, indent=2) if recent_news else 'No recent news available'}

KEY CONTACTS:
{json.dumps(key_contacts, indent=2) if key_contacts else 'No contacts available'}
"""

    prompt = f"""
You are a B2B sales intelligence analyst. Analyze the following company data and generate actionable insights.

{context}

Generate a comprehensive intelligence report with:

1. EXECUTIVE SUMMARY (2-3 sentences):
   - What they do and their market position
   - Recent strategic moves or signals
   - Overall business context

2. PAIN POINTS (3-4 key challenges they likely face):
   For each pain point, provide:
   - title: Short, specific title (e.g., "High Cloud Infrastructure Costs")
   - description: Why this is a pain point based on the data (1-2 sentences)
   - confidence: "High", "Medium", or "Low" based on evidence
   - source: What data led to this insight

3. OPENING LINES (2 personalized outreach messages):
   Generate opening lines for:
   a) DevOps/Infrastructure Leader
   b) Engineering Leadership (CTO/VP Engineering)
   
   Each opening line should:
   - Reference specific company context
   - Mention a relevant pain point or opportunity
   - Be concise and actionable (2-3 sentences max)
   - Include context about why this line would resonate

Return ONLY valid JSON in this exact format:
{{
  "executive_summary": "...",
  "pain_points": [
    {{
      "title": "...",
      "description": "...",
      "confidence": "High|Medium|Low",
      "source": "..."
    }}
  ],
  "opening_lines": {{
    "devops_manager": {{
      "role": "For DevOps/Infrastructure Manager",
      "message": "...",
      "context": "..."
    }},
    "head_of_engineering": {{
      "role": "For Head of Engineering/CTO",
      "message": "...",
      "context": "..."
    }}
  }}
}}

IMPORTANT: 
- Base insights on actual data provided
- If data is limited, be honest in confidence levels
- Make pain points specific and actionable
- Opening lines should feel personal, not generic
"""

    try:
        # Call Gemini API
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                response_mime_type="application/json"
            )
        )
        
        # Parse response
        intelligence_data = json.loads(response.text)
        
        # Validate and return
        return intelligence_data
        
    except Exception as e:
        print(f"Error generating intelligence: {e}")
        # Return default structure jika error
        return {
            "executive_summary": f"{company_name} is a company in the {overview.get('industry', 'technology')} industry.",
            "pain_points": [],
            "opening_lines": {}
        }


async def enrich_profile_with_intelligence(profile_data) -> dict:
    """
    Wrapper function untuk enrich scraped profile dengan AI intelligence
    """
    
    overview = profile_data.get('overview', {})
    if isinstance(overview, str):
        overview = json.loads(overview)
    
    tech_stack = profile_data.get('tech_stack', [])
    recent_news = profile_data.get('recent_news_signals', [])
    key_contacts = profile_data.get('key_contacts', [])
    
    intelligence = await generate_company_intelligence(
        company_name=profile_data.get('company_name', ''),
        overview=overview,
        tech_stack=tech_stack,
        recent_news=recent_news,
        key_contacts=key_contacts
    )
    
    return intelligence
