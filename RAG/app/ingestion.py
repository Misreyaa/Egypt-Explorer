import pandas as pd
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, PointStruct
from app.config import COLLECTION_NAME, QDRANT_URL, EMBEDDING_MODEL


model = SentenceTransformer(EMBEDDING_MODEL)
client = QdrantClient(url=QDRANT_URL)


def ingest_excel(path: str):
    df = pd.read_excel(path)
    df.columns = df.columns.str.lower().str.replace(" ", "_")

    client.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=model.get_sentence_embedding_dimension(),
            distance="Cosine"
        )
    )

    points = []

    for _, row in df.iterrows():
        place_id = str(row["place_id"])
        name = row["name"]

        chunks = []

        if pd.notna(row.get("short_description")):
            chunks.append(("description", row["short_description"]))

        if pd.notna(row.get("what_makes_it_special")):
            chunks.append(("significance", row["what_makes_it_special"]))

        for field, text in chunks:
            embedding = model.encode(text).tolist()
            points.append(
                PointStruct(
                    id=f"{place_id}_{field}",
                    vector=embedding,
                    payload={
                        "place_id": place_id,
                        "name": name,
                        "field_type": field,
                        "text": text,
                        "category": row.get("category"),
                        "accessibility": row.get("accessibility")
                    }
                )
            )

    client.upsert(collection_name=COLLECTION_NAME, points=points)
