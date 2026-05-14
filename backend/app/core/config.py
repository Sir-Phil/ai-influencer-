import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # 1. Provide a default for the Base URL
    base_url: str = "https://openrouter.ai/api/v1"
    
    # 2. Provide defaults for all API keys to prevent crashes during development
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    
    # This was the likely crash point. Added a default empty string.
    PERPLEXITY_API_KEY: str = os.getenv("PERPLEXITY_API_KEY", "")
    
    # Added default for Serper as well
    SERPER_API_KEY: str = os.getenv("SERPER_API_KEY", "")

    DATABASE_URL: str = "sqlite+aiosqlite:///./ai_influencer.db"
    
    # Persona Constants
    INFLUENCER_NAME: str = "Amaka AI"
    INFLUENCER_BIO: str = "A savvy, Pan-Nigerian digital advocate focusing on youth political inclusion."
    

    model_config = SettingsConfigDict(
        env_file=".env", 
        extra="ignore",
        env_file_encoding='utf-8'
    )

# Instantiate
settings = Settings()