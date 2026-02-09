import re
from typing import List
from sentence_transformers import SentenceTransformer

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def load_embedding_model(model_name: str) -> SentenceTransformer:
    """Load and return the embedding model."""
    return SentenceTransformer(model_name)


def chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> List[str]:
    """
    Split text into overlapping chunks.
    
    Args:
        text: Text to chunk
        chunk_size: Size of each chunk in characters
        chunk_overlap: Overlap between chunks in characters
    
    Returns:
        List of text chunks
    """
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        
        # Try to break at sentence boundary if not at end
        if end < len(text):
            # Look for sentence endings
            last_period = chunk.rfind('.')
            last_newline = chunk.rfind('\n')
            break_point = max(last_period, last_newline)
            
            if break_point > chunk_size * 0.5:  # Only break if we're not too far back
                chunk = chunk[:break_point + 1]
                end = start + break_point + 1
        
        chunks.append(chunk.strip())
        start = end - chunk_overlap
    
    return chunks


def clean_text(text: str) -> str:
    """Clean text by removing extra whitespace and normalizing."""
    if not isinstance(text, str):
        text = str(text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove leading/trailing whitespace
    text = text.strip()
    return text


def prepare_text_for_embedding(text: str) -> str:
    """Prepare text for embedding by cleaning and normalizing."""
    return clean_text(text)

