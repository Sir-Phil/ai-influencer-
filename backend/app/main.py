import uuid
import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

# Model & Agent Imports
from app.agents.fact_check_crew import FactCheckCrew
from app.agents.political_crew import PoliticalInfluencerCrew
from app.db.models import ContentDraft, FactCheck, AsyncSessionLocal, engine, Base
from pydantic import BaseModel
import asyncio




@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(title="Amaka AI Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TopicRequest(BaseModel):
    topic: str

class DraftUpdate(BaseModel):
    content: str

# --- Background Jobs ---

async def run_crew_job(job_id: str, topic: str):
    try:
        crew = PoliticalInfluencerCrew()
        # CrewAI kickoff is synchronous, but we wrap it in a background task
        result = crew.run(topic)
        
        async with AsyncSessionLocal() as session:
            # We use session.get and update instead of merge for cleaner async handling
            draft = await session.get(ContentDraft, job_id)
            if draft:
                draft.raw_content = str(result)
                draft.status = "review_required"
                await session.commit()
    except Exception as e:
        async with AsyncSessionLocal() as session:
            draft = await session.get(ContentDraft, job_id)
            if draft:
                draft.raw_content = f"Error: {str(e)}"
                draft.status = "failed"
                await session.commit()

# --- API Endpoints ---

@app.post("/api/v1/generate")
async def generate_content(request: TopicRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    
    # Pre-save the job so the frontend doesn't get a 404 while it's processing
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
    return {"id": job_id, "status": "AI research started..."}

@app.get("/api/v1/drafts/{job_id}")
async def get_draft(job_id: str):
    async with AsyncSessionLocal() as session:
        draft = await session.get(ContentDraft, job_id)
        if not draft:
            raise HTTPException(status_code=404, detail="Draft not found")
        return draft

@app.patch("/api/v1/drafts/{job_id}")
async def update_draft(job_id: str, data: DraftUpdate):
    async with AsyncSessionLocal() as session:
        draft = await session.get(ContentDraft, job_id)
        if not draft:
            raise HTTPException(status_code=404, detail="Draft not found")
        
        draft.raw_content = data.content
        await session.commit()
        return {"status": "updated", "id": job_id}

@app.post("/api/v1/fact-check")
async def perform_fact_check(data: dict):
    # data = {"claim": "Postponement of Rivers State elections"}
    crew = FactCheckCrew()
    result = crew.verify_claim(data["claim"])
    
    # Check if the result is already a dict or a string (CrewAI can return either)
    # result.raw usually contains the stringified JSON from the expected_output
    
    async with AsyncSessionLocal() as session:
        new_check = FactCheck(
            claim=data["claim"],
            verdict=result.get('verdict', 'Unknown'),
            explanation=result.get('summary', 'No summary provided'),
            links=result.get('sources', [])
        )
        session.add(new_check)
        await session.commit()
        await session.refresh(new_check)
        return new_check

@app.post("/api/v1/drafts/{job_id}/publish")
async def publish_draft(job_id: str):
    # Here you'd trigger the actual X/IG API
    return {"status": "published", "platform": "X/Instagram"}

@app.get("/api/v1/fact-check-history")
async def get_fact_checks():
    async with AsyncSessionLocal() as session:
        # Fetch the last 10 fact checks, newest first
        result = await session.execute(
            select(FactCheck).order_by(FactCheck.created_at.desc()).limit(10)
        )
        return result.scalars().all()
    

async def monitor_trending_topics():
    """Simulated background worker to keep the Truth Monitor fresh"""
    # In production, you'd fetch these from a News API or Trends API
    trending_claims = [
        "Port Harcourt refinery petrol loading dates",
        "New minimum wage implementation status in Rivers State",
        "INEC updates on local government elections"
    ]
    
    crew = FactCheckCrew()
    for claim in trending_claims:
        try:
            print(f"TRUTH MONITOR: Verifying {claim}...")
            # This triggers the Serper API search and Agent analysis
            result = crew.verify_claim(claim)
            # Save to DB here (using the logic we wrote in previous step)
            await asyncio.sleep(3600) # Check every hour
        except Exception as e:
            print(f"Monitor Error: {e}")

# Start the monitor when the app launches
@app.on_event("startup")
async def start_monitor():
    asyncio.create_task(monitor_trending_topics())