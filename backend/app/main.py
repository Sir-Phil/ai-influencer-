import uuid
import datetime
import asyncio
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from pydantic import BaseModel

# Model & Agent Imports
from app.agents.fact_check_crew import FactCheckCrew
from app.agents.political_crew import PoliticalInfluencerCrew
from app.agents.news_crew import GlobalNewsCrew 
from app.db.models import ContentDraft, FactCheck, AsyncSessionLocal, engine, Base

# Service Imports
from app.services.social_media import SocialMediaService
from app.utils.graphics import create_tiktok_card 

# --- Background Monitor Function ---
async def monitor_trending_topics():
    """Background loop for real-time verification of local claims."""
    # Wait for app to fully boot
    await asyncio.sleep(5)
    crew = FactCheckCrew()
    trending_claims = ["Rivers State 2026 Budget", "Port Harcourt Refinery Status"]
    
    try:
        while True:
            for claim in trending_claims:
                try:
                    print(f"TRUTH MONITOR: Verifying {claim}...")
                    crew.verify_claim(claim)
                except Exception as e:
                    print(f"Monitor Verification Error: {e}")
            # Run once an hour
            await asyncio.sleep(3600) 
    except asyncio.CancelledError:
        print("TRUTH MONITOR: Task received cancellation signal.")

# --- Lifespan Manager (The Modern Way) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP ---
    # 1. Initialize Database Tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # 2. Start Background Truth Monitor
    monitor_task = asyncio.create_task(monitor_trending_topics())
    print("MISSION CONTROL: System online. Truth Monitor background task started.")

    yield # <--- App runs here

    # --- SHUTDOWN ---
    print("MISSION CONTROL: Shutting down. Cleaning up background tasks...")
    monitor_task.cancel()
    try:
        await monitor_task
    except asyncio.CancelledError:
        pass
    
    await engine.dispose()
    print("MISSION CONTROL: Offline.")

# --- App Initialization ---
app = FastAPI(title="Amaka AI Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---
class TopicRequest(BaseModel):
    topic: str

class DraftUpdate(BaseModel):
    content: str

class PublishRequest(BaseModel):
    selected_content: str

# --- Background Agent Router ---
async def run_crew_job(job_id: str, topic: str):
    """
    Routes the user request to the specialized Agent Crew.
    """
    try:
        # Routing Logic for 2026 World News vs Local Politics
        news_keywords = ["football", "world cup", "fifa", "news", "headlines", "match", "trump", "china", "score"]
        
        if any(word in topic.lower() for word in news_keywords):
            crew_instance = GlobalNewsCrew()
            print(f"ROUTING: Deploying GlobalNewsCrew [2026 Context] for: {topic}")
        else:
            crew_instance = PoliticalInfluencerCrew()
            print(f"ROUTING: Deploying PoliticalInfluencerCrew for: {topic}")

        # Execute AI Research
        result = crew_instance.run(topic)
        
        async with AsyncSessionLocal() as session:
            draft = await session.get(ContentDraft, job_id)
            if draft:
                draft.raw_content = str(result)
                draft.status = "review_required"
                await session.commit()
                
    except Exception as e:
        print(f"AGENT ERROR: {e}")
        async with AsyncSessionLocal() as session:
            draft = await session.get(ContentDraft, job_id)
            if draft:
                # Store error in a format the frontend JSON parser won't break on
                error_msg = {"options": [{"type": "System Error", "content": f"Amaka encountered an error: {str(e)}"}]}
                draft.raw_content = json.dumps(error_msg)
                draft.status = "failed"
                await session.commit()

# --- API Endpoints ---

@app.post("/api/v1/generate")
async def generate_content(request: TopicRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    async with AsyncSessionLocal() as session:
        new_job = ContentDraft(
            id=job_id,
            topic=request.topic,
            raw_content="Amaka is researching...",
            status="processing"
        )
        session.add(new_job)
        await session.commit()

    background_tasks.add_task(run_crew_job, job_id, request.topic)
    return {"id": job_id, "status": "Processing"}

@app.get("/api/v1/drafts/{job_id}")
async def get_draft(job_id: str):
    async with AsyncSessionLocal() as session:
        draft = await session.get(ContentDraft, job_id)
        if not draft:
            raise HTTPException(status_code=404, detail="Draft not found")
        return draft

@app.post("/api/v1/drafts/{job_id}/publish")
async def publish_to_all(job_id: str, request: PublishRequest):
    async with AsyncSessionLocal() as session:
        draft = await session.get(ContentDraft, job_id)
        if not draft:
            raise HTTPException(status_code=404, detail="Draft not found")

        # Strip any accidental formatting
        clean_text = request.selected_content.replace("```json", "").replace("```", "").strip()

        # Image Creation
        try:
            image_path = create_tiktok_card(text=clean_text, filename=f"post_{job_id}", verdict="True")
        except Exception as e:
            print(f"Pillow Error: {e}")
            image_path = "static/posts/default.png"

        # Mock Dispatch
        social = SocialMediaService()
        results = await social.publish_to_all(clean_text, image_path)

        # Finalize State
        draft.status = "published"
        draft.raw_content = clean_text 
        await session.commit()
        
        return {"status": "dispatched", "results": results}

@app.get("/api/v1/fact-check-history")
async def get_fact_checks():
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(FactCheck).order_by(FactCheck.created_at.desc()).limit(10)
        )
        return result.scalars().all()