import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./walmart_supply_chain.db"
    
    # JWT
    secret_key: str = "your-super-secret-jwt-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    allowed_origins: List[str] = ["http://localhost:3000"]
    
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