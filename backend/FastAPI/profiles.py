from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .database import db
from .auth import get_current_user, verify_token
from .intelligence_service import enrich_profile_with_intelligence
from AgentScraper.schemas import CompanyProfile
from AgentScraper.profiler import run_sift_agent, run_sift_agent_with_streaming
import asyncpg
import json
import asyncio

router = APIRouter(
    prefix="/profiles",
    tags=["Company Profiles"]
)

class CreateProfileRequest(BaseModel):
    company_name: str = Field(..., example="PT Gojek Tokopedia")

class ProfileResponse(BaseModel):
    profile_id: str  # UUID
    user_id: str  # UUID
    company_name: str
    overview: Optional[dict] = None
    tech_stack: Optional[list] = None
    recent_news_signals: Optional[list] = None
    key_contacts: Optional[list] = None
    
    # New AI-generated fields
    executive_summary: Optional[str] = None
    pain_points: Optional[list] = None
    opening_lines: Optional[dict] = None
    data_sources: Optional[list] = None
    last_analyzed_at: Optional[str] = None
    
    created_at: str


@router.get("/create-stream")
async def create_profile_stream(
    company_name: str = Query(..., description="Company name to profile"),
    token: str = Query(..., description="JWT Bearer token")
):
    """
    Streaming endpoint untuk membuat company profile dengan real-time logs.
    
    **Note**: EventSource tidak support custom headers, jadi token dikirim via query param.
    
    Returns Server-Sent Events (SSE) stream dengan format:
    - data: <log message>\n\n untuk setiap log
    - data: DONE|<profile_id>\n\n ketika selesai
    - data: ERROR|<error message>\n\n jika terjadi error
    """
    # Verify token manually karena EventSource tidak bisa set header
    try:
        current_user = await verify_token(token)
    except Exception as e:
        async def error_generator():
            yield f"data: ERROR|Unauthorized: {str(e)}\n\n"
        return StreamingResponse(
            error_generator(),
            media_type="text/event-stream"
        )
    
    async def event_generator():
        try:
            # Send initial log
            yield f"data: 🚀 Starting profile generation for {company_name}...\n\n"
            await asyncio.sleep(0.1)
            
            # Step 1: Run SIFT agent with streaming logs
            yield f"data: 🔍 Running AI agent to gather company intelligence...\n\n"
            await asyncio.sleep(0.1)
            
            # Stream agent logs
            async for log_message in run_sift_agent_with_streaming(company_name):
                yield f"data: {log_message}\n\n"
                await asyncio.sleep(0.05)
            
            # Get the final result
            profile_data = await run_sift_agent(company_name)
            
            yield f"data: ✅ Agent completed! Processing data...\n\n"
            await asyncio.sleep(0.1)
            
            # Step 2: Generate AI intelligence
            yield f"data: 🧠 Generating AI intelligence (executive summary, pain points, opening lines)...\n\n"
            await asyncio.sleep(0.1)
            
            intelligence = await enrich_profile_with_intelligence({
                'company_name': company_name,
                'overview': profile_data.overview.dict() if profile_data.overview else {},
                'tech_stack': profile_data.tech_stack,
                'recent_news_signals': [news.dict() for news in profile_data.recent_news_signals] if profile_data.recent_news_signals else [],
                'key_contacts': [contact.dict() for contact in profile_data.key_contacts] if profile_data.key_contacts else []
            })
            
            yield f"data: ✅ AI intelligence generated!\n\n"
            await asyncio.sleep(0.1)
            
            # Step 3: Save to database
            yield f"data: 💾 Saving profile to database...\n\n"
            await asyncio.sleep(0.1)
            
            # Prepare data
            overview_json = json.dumps(profile_data.overview.dict()) if profile_data.overview else None
            tech_stack_json = json.dumps(profile_data.tech_stack) if profile_data.tech_stack else None
            recent_news_json = json.dumps([news.dict() for news in profile_data.recent_news_signals]) if profile_data.recent_news_signals else None
            key_contacts_json = json.dumps([contact.dict() for contact in profile_data.key_contacts]) if profile_data.key_contacts else None
            
            executive_summary = intelligence.get('executive_summary')
            pain_points_json = json.dumps(intelligence.get('pain_points', []))
            opening_lines_json = json.dumps(intelligence.get('opening_lines', {}))
            
            data_sources = []
            if profile_data.recent_news_signals:
                for news in profile_data.recent_news_signals:
                    if hasattr(news, 'url') and news.url:
                        data_sources.append(news.url)
            data_sources_json = json.dumps(data_sources) if data_sources else None
            
            # Save to database
            new_profile = await db.fetch_one(
                """
                INSERT INTO company_profiles 
                (user_id, company_name, overview, tech_stack, recent_news_signals, key_contacts,
                 executive_summary, pain_points, opening_lines, data_sources, last_analyzed_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING profile_id
                """,
                current_user["user_id"],
                company_name,
                overview_json,
                tech_stack_json,
                recent_news_json,
                key_contacts_json,
                executive_summary,
                pain_points_json,
                opening_lines_json,
                data_sources_json,
                datetime.utcnow()
            )
            
            profile_id = str(new_profile["profile_id"])
            
            yield f"data: ✅ Profile saved successfully!\n\n"
            await asyncio.sleep(0.1)
            
            # Send completion signal with profile ID
            yield f"data: DONE|{profile_id}\n\n"
            
        except Exception as e:
            error_msg = str(e)
            print(f"Error in stream: {error_msg}")
            yield f"data: ERROR|{error_msg}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable nginx buffering
        }
    )


@router.post("/create", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_company_profile(
    request: CreateProfileRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Membuat company profile baru untuk user yang sedang login.
    
    **Requires**: Bearer token di header Authorization
    
    Endpoint ini akan:
    1. Menjalankan SIFT AI agent untuk mendapatkan profil perusahaan
    2. Menyimpan profil ke database
    3. Mengembalikan profil yang telah disimpan
    """
    try:
        # Step 1: Jalankan SIFT agent untuk mendapatkan profil perusahaan
        profile_data: CompanyProfile = await run_sift_agent(request.company_name)
        
        # Step 2: Generate AI intelligence dari scraped data
        print(f"Generating AI intelligence for {request.company_name}...")
        intelligence = await enrich_profile_with_intelligence({
            'company_name': request.company_name,
            'overview': profile_data.overview.dict() if profile_data.overview else {},
            'tech_stack': profile_data.tech_stack,
            'recent_news_signals': [news.dict() for news in profile_data.recent_news_signals] if profile_data.recent_news_signals else [],
            'key_contacts': [contact.dict() for contact in profile_data.key_contacts] if profile_data.key_contacts else []
        })
        
        # Step 3: Prepare data untuk database
        # Convert ke format yang bisa disimpan di JSONB
        overview_json = json.dumps(profile_data.overview.dict()) if profile_data.overview else None
        tech_stack_json = json.dumps(profile_data.tech_stack) if profile_data.tech_stack else None
        recent_news_json = json.dumps([news.dict() for news in profile_data.recent_news_signals]) if profile_data.recent_news_signals else None
        key_contacts_json = json.dumps([contact.dict() for contact in profile_data.key_contacts]) if profile_data.key_contacts else None
        
        # AI-generated intelligence
        executive_summary = intelligence.get('executive_summary')
        pain_points_json = json.dumps(intelligence.get('pain_points', []))
        opening_lines_json = json.dumps(intelligence.get('opening_lines', {}))
        
        # Data sources (extract URLs from news signals - NewsSignal objects)
        data_sources = []
        if profile_data.recent_news_signals:
            for news in profile_data.recent_news_signals:
                if hasattr(news, 'url') and news.url:
                    data_sources.append(news.url)
        data_sources_json = json.dumps(data_sources) if data_sources else None
        
        # Step 4: Simpan ke database dengan AI intelligence
        new_profile = await db.fetch_one(
            """
            INSERT INTO company_profiles 
            (user_id, company_name, overview, tech_stack, recent_news_signals, key_contacts,
             executive_summary, pain_points, opening_lines, data_sources, last_analyzed_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING profile_id, user_id, company_name, overview, tech_stack, 
                      recent_news_signals, key_contacts, executive_summary, pain_points,
                      opening_lines, data_sources, last_analyzed_at, created_at
            """,
            current_user["user_id"],
            request.company_name,
            overview_json,
            tech_stack_json,
            recent_news_json,
            key_contacts_json,
            executive_summary,
            pain_points_json,
            opening_lines_json,
            data_sources_json,
            datetime.utcnow()
        )
        
        return ProfileResponse(
            profile_id=str(new_profile["profile_id"]),  # Convert UUID to string
            user_id=str(new_profile["user_id"]),  # Convert UUID to string
            company_name=new_profile["company_name"],
            overview=json.loads(new_profile["overview"]) if new_profile["overview"] else None,
            tech_stack=json.loads(new_profile["tech_stack"]) if new_profile["tech_stack"] else None,
            recent_news_signals=json.loads(new_profile["recent_news_signals"]) if new_profile["recent_news_signals"] else None,
            key_contacts=json.loads(new_profile["key_contacts"]) if new_profile["key_contacts"] else None,
            executive_summary=new_profile["executive_summary"],
            pain_points=json.loads(new_profile["pain_points"]) if new_profile["pain_points"] else None,
            opening_lines=json.loads(new_profile["opening_lines"]) if new_profile["opening_lines"] else None,
            data_sources=json.loads(new_profile["data_sources"]) if new_profile["data_sources"] else None,
            last_analyzed_at=str(new_profile["last_analyzed_at"]) if new_profile["last_analyzed_at"] else None,
            created_at=str(new_profile["created_at"])
        )
    
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Error creating profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create profile: {str(e)}"
        )


@router.get("/my-profiles", response_model=list[ProfileResponse])
async def get_my_profiles(current_user: dict = Depends(get_current_user)):
    """
    Mendapatkan semua company profiles milik user yang sedang login.
    
    **Requires**: Bearer token di header Authorization
    """
    try:
        profiles = await db.fetch_all(
            """
            SELECT profile_id, user_id, company_name, overview, tech_stack,
                   recent_news_signals, key_contacts, executive_summary, pain_points,
                   opening_lines, data_sources, last_analyzed_at, created_at
            FROM company_profiles
            WHERE user_id = $1
            ORDER BY created_at DESC
            """,
            current_user["user_id"]
        )
        
        result = []
        for profile in profiles:
            result.append(ProfileResponse(
                profile_id=str(profile["profile_id"]),  # Convert UUID to string
                user_id=str(profile["user_id"]),  # Convert UUID to string
                company_name=profile["company_name"],
                overview=json.loads(profile["overview"]) if profile["overview"] else None,
                tech_stack=json.loads(profile["tech_stack"]) if profile["tech_stack"] else None,
                recent_news_signals=json.loads(profile["recent_news_signals"]) if profile["recent_news_signals"] else None,
                key_contacts=json.loads(profile["key_contacts"]) if profile["key_contacts"] else None,
                executive_summary=profile["executive_summary"],
                pain_points=json.loads(profile["pain_points"]) if profile["pain_points"] else None,
                opening_lines=json.loads(profile["opening_lines"]) if profile["opening_lines"] else None,
                data_sources=json.loads(profile["data_sources"]) if profile["data_sources"] else None,
                last_analyzed_at=str(profile["last_analyzed_at"]) if profile["last_analyzed_at"] else None,
                created_at=str(profile["created_at"])
            ))
        
        return result
    
    except Exception as e:
        print(f"Error getting profiles: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get profiles: {str(e)}"
        )


@router.get("/{profile_id}", response_model=ProfileResponse)
async def get_profile_by_id(
    profile_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Mendapatkan detail company profile berdasarkan ID.
    
    **Requires**: Bearer token di header Authorization
    
    User hanya bisa mengakses profile miliknya sendiri.
    """
    try:
        profile = await db.fetch_one(
            """
            SELECT profile_id, user_id, company_name, overview, tech_stack,
                   recent_news_signals, key_contacts, executive_summary, pain_points,
                   opening_lines, data_sources, last_analyzed_at, created_at
            FROM company_profiles
            WHERE profile_id = $1::uuid AND user_id = $2
            """,
            profile_id,
            current_user["user_id"]
        )
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found or you don't have access"
            )
        
        return ProfileResponse(
            profile_id=str(profile["profile_id"]),  # Convert UUID to string
            user_id=str(profile["user_id"]),  # Convert UUID to string
            company_name=profile["company_name"],
            overview=json.loads(profile["overview"]) if profile["overview"] else None,
            tech_stack=json.loads(profile["tech_stack"]) if profile["tech_stack"] else None,
            recent_news_signals=json.loads(profile["recent_news_signals"]) if profile["recent_news_signals"] else None,
            key_contacts=json.loads(profile["key_contacts"]) if profile["key_contacts"] else None,
            executive_summary=profile["executive_summary"],
            pain_points=json.loads(profile["pain_points"]) if profile["pain_points"] else None,
            opening_lines=json.loads(profile["opening_lines"]) if profile["opening_lines"] else None,
            data_sources=json.loads(profile["data_sources"]) if profile["data_sources"] else None,
            last_analyzed_at=str(profile["last_analyzed_at"]) if profile["last_analyzed_at"] else None,
            created_at=str(profile["created_at"])
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get profile: {str(e)}"
        )


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(
    profile_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Menghapus company profile berdasarkan ID.
    
    **Requires**: Bearer token di header Authorization
    
    User hanya bisa menghapus profile miliknya sendiri.
    """
    try:
        # Cek apakah profile ada dan milik user ini
        existing = await db.fetch_one(
            "SELECT profile_id FROM company_profiles WHERE profile_id = $1::uuid AND user_id = $2",
            profile_id,
            current_user["user_id"]
        )
        
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found or you don't have access"
            )
        
        # Hapus profile
        await db.execute(
            "DELETE FROM company_profiles WHERE profile_id = $1::uuid",
            profile_id
        )
        
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete profile: {str(e)}"
        )
