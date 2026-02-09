from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from app.config import COLLECTION_NAME, QDRANT_URL, EMBEDDING_MODEL


client = QdrantClient(url=QDRANT_URL)
model = SentenceTransformer(EMBEDDING_MODEL)


def retrieve(query: str, top_k: int = 5, wheelchair_only=False):
    vector = model.encode(query).tolist()

    search_filter = None
    if wheelchair_only:
        search_filter = {
            "must": [
                {
                    "key": "accessibility",
                    "match": {"text": "Wheelchair accessible"}
                }
            ]
        }

    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=vector,
        limit=top_k,
        with_payload=True,
        query_filter=search_filter
    )

    return results
