from pydantic_settings import BaseSettings
from typing import List, Union
import json


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+psycopg://user:pass@localhost:5432/app"
    
    # JWT
    jwt_secret: str = "your-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expires_min: int = 15
    
    # CORS - can be JSON string or list
    cors_origins: Union[List[str], str] = ["http://localhost:3000"]
    
    # Finnhub
    finnhub_api_key: str = ""
    
    # Trading
    starting_cash: float = 100000.0
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Parse CORS_ORIGINS if it's a JSON string
        if isinstance(self.cors_origins, str):
            try:
                self.cors_origins = json.loads(self.cors_origins)
            except (json.JSONDecodeError, TypeError):
                # Fallback: treat as comma-separated string
                self.cors_origins = [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()


