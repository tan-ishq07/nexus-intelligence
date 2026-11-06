import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NEXUS INTELLIGENCE"
    VERSION: str = "1.0.0-ENTERPRISE"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./nexus_intelligence.db"
    ).replace("postgres://", "postgresql://", 1) if os.getenv("DATABASE_URL", "").startswith("postgres://") else os.getenv("DATABASE_URL", "sqlite:///./nexus_intelligence.db")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        origin.strip() for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,https://frontend-sage-six-23.vercel.app,*"
        ).split(",") if origin.strip()
    ]
    
    # Host / Port
    HOST: str = os.getenv("API_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", os.getenv("API_PORT", "8000")))

    class Config:
        case_sensitive = True

settings = Settings()
