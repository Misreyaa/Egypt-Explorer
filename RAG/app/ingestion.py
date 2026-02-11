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
    mongo_db = mongo[mongodb_db]
    mongo_collection = mongo_db[collection]
    docs: Iterable[Dict[str, Any]] = mongo_collection.find({})

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

        # -----------------------------
        # Normalize opening/closing hours → minutes
        # -----------------------------
        opening_hour = d.get("opening_hour")
        closing_hour = d.get("closing_hour")

        open_minutes = None
        close_minutes = None

        try:
            if opening_hour is not None:
                oh = float(opening_hour)
                if 0.0 <= oh <= 24.0:
                    open_minutes = int(oh * 60)
            if closing_hour is not None:
                ch = float(closing_hour)
                if 0.0 <= ch <= 24.0:
                    close_minutes = int(ch * 60)
        except (TypeError, ValueError):
            # Leave minutes as None if parsing fails
            open_minutes = None
            close_minutes = None

        # Persist normalized minutes back into Mongo so numeric filters
        # can be applied directly in the API layer.
        update_fields: Dict[str, Any] = {}
        if open_minutes is not None:
            update_fields["open_minutes"] = open_minutes
        if close_minutes is not None:
            update_fields["close_minutes"] = close_minutes
        if update_fields:
            mongo_collection.update_one({"_id": d["_id"]}, {"$set": update_fields})

        # -----------------------------
        # Build Qdrant payloads
        # -----------------------------
        # 1) Activities → individual "activity" chunks
        activities = d.get("activities") or []
        if isinstance(activities, list):
            for raw_activity in activities:
                if not isinstance(raw_activity, str):
                    continue
                activity_text = raw_activity.strip()
                if not activity_text:
                    continue

                embedding = model.encode(activity_text).tolist()
                points.append(
                    PointStruct(
                        id=str(uuid4()),
                        vector=embedding,
                        payload={
                            "place_id": place_id,
                            "name": name,
                            "field_type": "activity",
                            "chunk_type": "activity",
                            "text": activity_text,
                            "category": category,
                            "city": city,
                            "governorate": governorate,
                            "accessibility": accessibility,
                            "is_wheelchair_accessible": is_wheelchair_accessible,
                        },
                    )
                )

        # 2) Descriptive content → single combined "description" chunk
        short_description = (d.get("short_description") or "").strip()
        historical_context = (d.get("historical_context") or "").strip()
        what_makes_it_special = (d.get("what_makes_it_special") or "").strip()
        sub_category = (d.get("sub_category") or "").strip()
        raw_category = (d.get("category") or "").strip()

        tags_value = d.get("tags") or []
        if isinstance(tags_value, list):
            tags_text = ", ".join(str(t).strip() for t in tags_value if str(t).strip())
        else:
            tags_text = str(tags_value).strip()

        description_parts: list[str] = []
        for part in [
            short_description,
            what_makes_it_special,
            historical_context,
            sub_category,
            raw_category,
            f"tags: {tags_text}" if tags_text else "",
        ]:
            if part:
                description_parts.append(part)

        if description_parts:
            combined_text = "\n".join(description_parts)
            embedding = model.encode(combined_text).tolist()
            points.append(
                PointStruct(
                    id=str(uuid4()),
                    vector=embedding,
                    payload={
                        "place_id": place_id,
                        "name": name,
                        "field_type": "description",
                        "chunk_type": "description",
                        "text": combined_text,
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
