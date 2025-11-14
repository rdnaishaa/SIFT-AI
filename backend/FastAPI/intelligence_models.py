from pydantic import BaseModel, Field
from typing import List, Optional

class PainPoint(BaseModel):
    """Model untuk pain point perusahaan"""
    title: str = Field(..., description="Short pain point title")
    description: str = Field(..., description="Detailed explanation of the pain point")
    confidence: str = Field(..., description="Confidence level: High, Medium, Low")
    source: Optional[str] = Field(None, description="Source of this insight")

class OpeningLine(BaseModel):
    """Model untuk AI-generated opening line"""
    role: str = Field(..., description="Target role, e.g., 'For DevOps Manager'")
    message: str = Field(..., description="The personalized opening line")
    context: str = Field(..., description="Why this line works / context used")

class CompanyIntelligence(BaseModel):
    """Extended model dengan AI-generated intelligence"""
    # Basic info
    company_name: str
    
    # Quick facts (from overview)
    industry: Optional[str] = None
    location: Optional[str] = None
    employee_count: Optional[str] = None
    
    # AI Generated Content
    executive_summary: Optional[str] = Field(None, description="AI-generated executive summary")
    pain_points: List[PainPoint] = Field(default_factory=list, description="Identified pain points")
    opening_lines: dict = Field(default_factory=dict, description="Opening lines per role")
    
    # Traditional scraped data
    tech_stack: List[str] = Field(default_factory=list)
    recent_news_signals: List[dict] = Field(default_factory=list)
    key_contacts: List[dict] = Field(default_factory=list)
    
    # Metadata
    data_sources: List[str] = Field(default_factory=list, description="URLs/sources used")
    last_analyzed_at: Optional[str] = None
