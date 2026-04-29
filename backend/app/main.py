import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.agents.fact_check_crew import FactCheckCrew

from pydantic import BaseModel


from app.agents.political_crew import PoliticalInfluencerCrew
from app.db.models import ContentDraft, AsyncSessionLocal, engine, Base

# 1. Define the Lifespan (Replacement for on_event)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic: Initialize the database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield  # The application runs here
    
    # Shutdown logic (if you need to close connections explicitly)
    await engine.dispose()

# 2. Initialize FastAPI with Lifespan
app = FastAPI(
    title="Amaka AI Backend",
    lifespan=lifespan
)

# 3. Add CORS Middleware (Required for Next.js to talk to FastAPI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TopicRequest(BaseModel):
    topic: str

# 4. Background Task Logic
async def run_crew_job(job_id: str, topic: str):
    try:
        crew = PoliticalInfluencerCrew()
        # Ensure your crew.run method is synchronous or properly awaited
        result = crew.run(topic)
        
        async with AsyncSessionLocal() as session:
            draft = ContentDraft(
                id=job_id, 
                topic=topic, 
                raw_content=str(result), 
                status="review_required"
            )
            await session.merge(draft)
            await session.commit()
    except Exception as e:
        # Log the error and update status so frontend knows it failed
        async with AsyncSessionLocal() as session:
            failed_draft = ContentDraft(
                id=job_id, 
                topic=topic, 
                raw_content=f"Error: {str(e)}", 
                status="failed"
            )
            await session.merge(failed_draft)
            await session.commit()

# 5. API Endpoints
@app.post("/api/v1/generate")
async def generate_content(request: TopicRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    # You might want to save an initial 'processing' record to the DB here
    background_tasks.add_task(run_crew_job, job_id, request.topic)
    return {"job_id": job_id, "status": "AI research started..."}

@app.get("/api/v1/drafts/{job_id}")
async def get_draft(job_id: str):
    async with AsyncSessionLocal() as session:
        draft = await session.get(ContentDraft, job_id)
        if not draft:
            raise HTTPException(status_code=404, detail="Draft not found or still processing")
        return draft
    
class DraftUpdate(BaseModel):
    content: str
    

@app.patch("/api/v1/drafts/{job_id}")
async def update_draft(job_id: str, data: DraftUpdate):
    # Logic: Find the record in your DB and update the raw_content
    # db.execute(update(Draft).where(id=job_id).values(raw_content=data.content))
    return {"status": "updated"}

@app.post("/api/v1/drafts/{job_id}/publish")
async def publish_draft(job_id: str):
    # Logic: Retrieve the draft and send to X/IG APIs
    # x_client.create_tweet(text=draft.raw_content)
    return {"status": "published", "platform": "X/Instagram"}

@app.post("/api/v1/fact-check")
async def perform_fact_check(data: dict):
    # data = {"claim": "INEC has postponed the Rivers State local elections"}
    crew = FactCheckCrew()
    result = crew.verify_claim(data["claim"])
    
    # In a real app, you'd save this to the DB here
    return {
        "claim": data["claim"],
        "result": result.raw # This returns the JSON from the task
    }
    