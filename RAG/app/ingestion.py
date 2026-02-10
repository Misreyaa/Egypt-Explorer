from uuid import uuid4
import os
from typing import Any, Dict, Iterable

from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, PointStruct
from qdrant_client.http.exceptions import UnexpectedResponse
from app.config import COLLECTION_NAME, QDRANT_URL, EMBEDDING_MODEL

model = SentenceTransformer(EMBEDDING_MODEL)
client = QdrantClient(url=QDRANT_URL)

def _normalize_str(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, str):
        s = value.strip()
        return s.lower() if s else None
    return str(value).strip().lower() or None


def _is_wheelchair_accessible(accessibility: Any) -> bool:
    if not isinstance(accessibility, str):
        return False
    normalized = accessibility.strip().lower()
    return normalized in {"wheelchair accessible", "accessible", "yes", "fully accessible"}


def ingest_mongodb(
    mongodb_uri: str | None = None,
    mongodb_db: str | None = None,
    collection: str = "destinations",
) -> int:
    """
    MongoDB (source of truth) → embeddings → Qdrant.

    Reads destination documents from MongoDB and indexes the key descriptive
    text fields (`short_description`, `historical_context`,
    `what_makes_it_special`) into Qdrant.

    All structured facts (fees, hours, etc.) remain in MongoDB and are queried
    directly, not via embeddings.

    Returns the number of points upserted.
    """
    mongodb_uri = mongodb_uri or os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    mongodb_db = mongodb_db or os.getenv("MONGODB_DB", "egyreal")

    mongo = MongoClient(mongodb_uri)
    docs: Iterable[Dict[str, Any]] = mongo[mongodb_db][collection].find({})

    try:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=model.get_sentence_embedding_dimension(),
                distance="Cosine",
            ),
        )
    except UnexpectedResponse as e:
        # 409 = collection already exists → ignore, re-raise other errors
        if "already exists" not in str(e) and "409" not in str(e):
            raise

    points: list[PointStruct] = []

    for d in docs:
        place_id = str(d.get("place_id") or "").strip()
        if not place_id:
            continue

        name = d.get("name")
        city = _normalize_str(d.get("city"))
        governorate = d.get("governorate")
        category = _normalize_str(d.get("category"))
        accessibility = d.get("accessibility")
        is_wheelchair_accessible = _is_wheelchair_accessible(accessibility)

        # Only embed key descriptive fields; structured facts (fees, hours, etc.)
        # are answered directly from MongoDB.
        text_fields = [
            "short_description",
            "historical_context",
            "what_makes_it_special",
        ]

        chunks: list[tuple[str, str]] = []
        for field in text_fields:
            value = d.get(field)
            if isinstance(value, str):
                text = value.strip()
                if text:
                    chunks.append((field, text))

        for field, text in chunks:
            embedding = model.encode(text).tolist()
            points.append(
                PointStruct(
                    id=str(uuid4()),
                    vector=embedding,
                    payload={
                        "place_id": place_id,
                        "name": name,
                        "field_type": field,
                        "text": text,
                        "category": category,
                        "city": city,
                        "governorate": governorate,
                        "accessibility": accessibility,
                        "is_wheelchair_accessible": is_wheelchair_accessible,
                    },
                )
            )

    if points:
        client.upsert(collection_name=COLLECTION_NAME, points=points)

    return len(points)
