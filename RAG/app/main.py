from fastapi import FastAPI
from app.models import QueryRequest, QueryResponse
from app.retrieval import retrieve
from app.generation import build_context


app = FastAPI(title="Egypt Tourism RAG")


@app.post("/query", response_model=QueryResponse)
def query_rag(req: QueryRequest):
    results = retrieve(
        req.query,
        wheelchair_only=req.wheelchair_only
    )

    context = build_context(results)

    # 🔥 LLM CALL GOES HERE
    answer = f"ANSWER BASED ON:\n{context}"

    sources = [
        {
            "place_id": r.payload["place_id"],
            "field_type": r.payload["field_type"]
        }
        for r in results
    ]

    return {
        "response": answer,
        "sources": sources
    }
