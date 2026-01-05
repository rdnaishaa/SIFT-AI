import asyncio
import sys
import traceback

if sys.platform == 'win32':
    from asyncio import WindowsProactorEventLoopPolicy
    asyncio.set_event_loop_policy(WindowsProactorEventLoopPolicy())

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

print("🚀 Starting SIFT API...")
print("📦 Loading modules...")

# Import with error handling
try:
    from AgentScraper.schemas import CompanyProfile
    from AgentScraper.profiler import run_sift_agent
    print("✅ AgentScraper loaded")
except Exception as e:
    print(f"⚠️ Warning: Could not load AgentScraper: {e}")
    CompanyProfile = None
    run_sift_agent = None

try:
    from .database import db
    print("✅ Database module loaded")
except Exception as e:
    print(f"⚠️ Warning: Could not load database: {e}")
    db = None

try:
    from .users import router as auth_router
    from .profiles import router as profiles_router
    print("✅ Routers loaded")
except Exception as e:
    print(f"⚠️ Warning: Could not load routers: {e}")
    auth_router = None
    profiles_router = None

try:
    from .intelligence_service import chat_with_profile_context_stream
    print("✅ Intelligence service loaded")
except Exception as e:
    print(f"⚠️ Warning: Could not load intelligence service: {e}")
    chat_with_profile_context_stream = None

app = FastAPI(
    title="SIFT API",
    description="API untuk SIFT User Profiling Agentic AI dengan Authentication",
    version="1.0.0"
)

# Event handlers untuk database connection
@app.on_event("startup")
async def startup():
    """Connect ke database saat aplikasi start"""
    print("🔧 Running startup tasks...")
    
    if db is None:
        print("⚠️ Database module not loaded, skipping database connection")
        return
    
    try:
        print("📡 Attempting database connection...")
        await db.connect()
        print("✅ Database connected successfully")
        
        # Ensure status and error_message columns exist
        try:
            await db.execute("""
                ALTER TABLE company_profiles 
                ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'completed';
            """)
            await db.execute("""
                ALTER TABLE company_profiles 
                ADD COLUMN IF NOT EXISTS error_message TEXT;
            """)
            print("✅ Database schema updated")
        except Exception as e:
            print(f"⚠️ Warning: Could not alter table: {e}")
    except Exception as e:
        print(f"❌ ERROR: Failed to connect to database: {e}")
        print(f"⚠️ Application will start but database operations will fail")
        print(f"⚠️ Please check DATABASE_URL environment variable")
        traceback.print_exc()
    
    print("✅ Startup complete!")

@app.on_event("shutdown")
async def shutdown():
    """Disconnect dari database saat aplikasi shutdown"""
    try:
        await db.disconnect()
    except Exception as e:
        print(f"Warning during shutdown: {e}")

origins = [
    "http://localhost",
    "http://localhost:5173",
    "https://sift-ai-pink.vercel.app",
    "https://www.sift-ai-pink.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers if loaded successfully
if auth_router:
    app.include_router(auth_router)
    print("✅ Auth router registered")
if profiles_router:
    app.include_router(profiles_router)
    print("✅ Profiles router registered")

class ProfileRequest(BaseModel):
    company_name: str = Field(..., example="PT Gojek Tokopedia")

@app.get("/")
def read_root():
    """Endpoint root untuk mengecek apakah API berjalan."""
    db_status = "not_loaded"
    if db:
        db_status = "connected" if db.pool else "disconnected"
    
    return {
        "message": "SIFT API is running. Go to /docs for API documentation.",
        "status": "healthy",
        "database": db_status,
        "modules": {
            "database": db is not None,
            "scraper": run_sift_agent is not None,
            "auth": auth_router is not None,
            "intelligence": chat_with_profile_context_stream is not None
        }
    }

@app.get("/health")
def health_check():
    """Simple health check endpoint untuk Railway"""
    return {"status": "ok", "service": "SIFT-AI"}


@app.post("/generate-profile", response_model=CompanyProfile)
async def generate_profile_endpoint(request: ProfileRequest):
    """
    Menerima nama perusahaan, menjalankan SIFT AI agent,
    dan mengembalikan profil perusahaan yang terstruktur.
    """
    print(f"Received request to profile: {request.company_name}")
    try:
        profile_data = await run_sift_agent(request.company_name)
        return profile_data
    
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"Unexpected error in endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected internal server error occurred: {e}")

class ChatRequest(BaseModel):
    question: str
    profile_context: dict

@app.post("/api/chat-profile")
async def chat_profile_endpoint(request: ChatRequest):
    """
    Endpoint untuk chat dengan AI mengenai profil perusahaan tertentu (Streaming).
    """
    return StreamingResponse(
        chat_with_profile_context_stream(request.question, request.profile_context),
        media_type="text/plain"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)