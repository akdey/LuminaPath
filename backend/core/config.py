import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "")
    youtube_api_key: str = ""
    jwt_secret_key: str = "fallback_secret_key_which_is_thirty_two_bytes_long"
    
    class Config:
        env_file = ".env"

settings = Settings()
