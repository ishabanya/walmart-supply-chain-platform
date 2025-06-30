import os
import json
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./walmart_supply_chain.db"
    
    # JWT
    secret_key: str = "your-super-secret-jwt-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS - can be overridden by ALLOWED_ORIGINS environment variable
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "https://walmart-supply-chain-platform.vercel.app",
        "https://walmart-supply-chain-platform-git-master-ishabanya.vercel.app",
        "https://walmart-supply-chain-platform-ishabanya.vercel.app"
    ]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Override allowed_origins from environment variable if present
        if os.getenv("ALLOWED_ORIGINS"):
            try:
                self.allowed_origins = json.loads(os.getenv("ALLOWED_ORIGINS"))
            except json.JSONDecodeError:
                # If JSON parsing fails, treat as comma-separated string
                self.allowed_origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS").split(",")]
    
    # Environment
    environment: str = "development"
    
    # API
    api_v1_str: str = "/api/v1"
    
    # WebSocket
    websocket_heartbeat_interval: int = 30
    
    class Config:
        env_file = ".env"


# Global settings instance
settings = Settings() 