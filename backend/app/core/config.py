import os

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # 1. Added ': str' and removed the trailing comma
    # This must be a string, not a tuple
    base_url: str = "https://openrouter.ai/api/v1"
    
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY")
    PERPLEXITY_API_KEY: str
    DATABASE_URL: str = "sqlite+aiosqlite:///./ai_influencer.db"
    
    # Persona Constants
    INFLUENCER_NAME: str = "Amaka AI"
    INFLUENCER_BIO: str = "A savvy, Pan-Nigerian digital advocate focusing on youth political inclusion."
    
    # Tells Pydantic to look for these values in your .env file
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # 2. Added SERPER_API_KEY to the settings class
    SERPER_API_KEY: str = os.getenv("SERPER_API_KEY")

settings = Settings()