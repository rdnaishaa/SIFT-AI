"""
Definisi Skema Pydantic (Struktur Data) untuk Proyek SIFT.
Dibuat opsional untuk mentolerir data yang hilang (fault tolerance).
"""

from pydantic import BaseModel, Field
from typing import List, Optional

class CompanyOverview(BaseModel):
    # Semua field di sini boleh kosong (None)
    industry: Optional[str] = Field(default=None, description="The main industry the company operates in.")
    location: Optional[str] = Field(default=None, description="The company's headquarters, e.g., 'Jakarta, Indonesia'")
    employee_count: Optional[str] = Field(default=None, description="Estimated number of employees, e.g., '1000-5000'")
    website: Optional[str] = Field(default=None, description="The company's official website URL")
    founded_year: Optional[str] = Field(default=None, description="The year the company was founded, e.g., '2010'")

class NewsSignal(BaseModel):
    # Judul dan URL adalah opsional. Mungkin agent hanya menemukan salah satunya.
    title: Optional[str] = Field(default=None, description="The title of the news article or blog post.")
    url: str = Field(..., description="The direct URL to the news article.") # Kita anggap URL wajib ada
    signal_type: Optional[str] = Field(default=None, description="The buying signal detected, e.g., 'Hiring', 'Funding', 'Expansion'")

class KeyContact(BaseModel):
    # Nama wajib ada, tapi jabatan (title) opsional
    name: str = Field(..., description="The full name of the contact person.")
    title: Optional[str] = Field(default=None, description="The job title of the contact, e.g., 'CTO' or 'Head of Engineering'")

class CompanyProfile(BaseModel):
    company_name: str = Field(..., description="The official name of the company being profiled.")
    
    # Gunakan default_factory untuk membuat objek/list kosong jika tidak ada data
    overview: CompanyOverview = Field(default_factory=CompanyOverview)
    tech_stack: List[str] = Field(default_factory=list, description="A list of key technologies the company uses")
    recent_news_signals: List[NewsSignal] = Field(default_factory=list, description="A list of recent news articles or signals")
    key_contacts: List[KeyContact] = Field(default_factory=list, description="A list of key contacts")