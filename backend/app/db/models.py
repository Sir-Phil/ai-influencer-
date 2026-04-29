from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from sqlalchemy import String, Text, DateTime, JSON
import datetime
import uuid # For generating IDs
from app.core.config import settings

# --- Setup ---
engine = create_async_engine(settings.DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

# --- Models ---

class ContentDraft(Base):
    __tablename__ = "content_drafts"
    
    # Using uuid4 for safer unique IDs
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    topic: Mapped[str] = mapped_column(String(255))
    raw_content: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), default="pending") 
    
    # UTC Now is best practice for election tracking
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc)
    )

class FactCheck(Base):
    __tablename__ = "fact_checks"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    claim: Mapped[str] = mapped_column(String(500))
    verdict: Mapped[str] = mapped_column(String(50)) # True, False, Misleading
    explanation: Mapped[str] = mapped_column(Text)
    
    # JSON is great for SQLite/Postgres to store source lists
    links: Mapped[list] = mapped_column(JSON, default=list) 
    
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc)
    )

