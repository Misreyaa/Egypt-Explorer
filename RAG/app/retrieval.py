from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue
from sentence_transformers import SentenceTransformer

from app.config import COLLECTION_NAME, QDRANT_URL, EMBEDDING_MODEL


client = QdrantClient(url=QDRANT_URL)
model = SentenceTransformer(EMBEDDING_MODEL)


def retrieve(
    query: str,
    top_k: int = 5,
    wheelchair_only: bool = False,
    city: str | None = None,
    category: str | None = None,
):
    """
    Retrieve top_k points from Qdrant with hard metadata filters applied.
    """
    vector = model.encode(query).tolist()

    must_conditions: list[FieldCondition] = []

    if wheelchair_only:
        must_conditions.append(
            FieldCondition(
                key="is_wheelchair_accessible",
                match=MatchValue(value=True),
            )
        )

    if city:
        city = city.strip().lower()
        must_conditions.append(
            FieldCondition(
                key="city",
                match=MatchValue(value=city),
            )
        )

    if category:
        category = category.strip().lower()
        must_conditions.append(
            FieldCondition(
                key="category",
                match=MatchValue(value=category),
            )
        )

    search_filter = Filter(must=must_conditions) if must_conditions else None

    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=vector,
        limit=top_k,
        with_payload=True,
        query_filter=search_filter,
    )

    return results
