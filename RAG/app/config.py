import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration from environment variables."""
    
    # Qdrant settings
    qdrant_url: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    qdrant_api_key: Optional[str] = os.getenv("QDRANT_API_KEY")
    collection_name: str = os.getenv("QDRANT_COLLECTION", "egypt_places")
    
    # Embedding model
    embedding_model_name: str = os.getenv(
        "EMBEDDING_MODEL_NAME", 
        "sentence-transformers/all-MiniLM-L6-v2"
    )
    
    # LLM settings (Groq)
    groq_api_key: Optional[str] = os.getenv("GROQ_API_KEY")
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    # MongoDB settings (source of truth for places)
    mongodb_uri: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    mongodb_db: str = os.getenv("MONGODB_DB", "egyreal")
    
    # RAG settings
    top_k: int = int(os.getenv("TOP_K", "10"))
    chunk_size: int = int(os.getenv("CHUNK_SIZE", "500"))
    chunk_overlap: int = int(os.getenv("CHUNK_OVERLAP", "50"))
    
    class Config:
        env_file = ".env"
        case_sensitive = False


def get_settings() -> Settings:
    """Get application settings."""
    return Settings()


# Export constants for direct import
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "egypt_places")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
