

import asyncio
import sys

if sys.platform == 'win32':
    from asyncio import WindowsProactorEventLoopPolicy
    asyncio.set_event_loop_policy(WindowsProactorEventLoopPolicy())

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from fastapi.middleware.cors import CORSMiddleware

from AgentScraper.schemas import CompanyProfile
from AgentScraper.profiler import run_sift_agent
from .database import db
from .users import router as auth_router
from .profiles import router as profiles_router

load_dotenv()

app = FastAPI(
    title="SIFT API",
    description="API untuk SIFT User Profiling Agentic AI dengan Authentication",
    version="1.0.0"
)

# Event handlers untuk database connection
@app.on_event("startup")
async def startup():
    """Connect ke database saat aplikasi start"""
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    """Disconnect dari database saat aplikasi shutdown"""
    await db.disconnect()

origins = [
    "http://localhost",
    "http://localhost:5173", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication router
app.include_router(auth_router)
# Include profiles router (protected routes)
app.include_router(profiles_router)

class ProfileRequest(BaseModel):
    company_name: str = Field(..., example="PT Gojek Tokopedia")

@app.get("/")
def read_root():
    """Endpoint root untuk mengecek apakah API berjalan."""
    return {"message": "SIFT API is running. Go to /docs for API documentation."}


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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)