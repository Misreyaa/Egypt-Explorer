from typing import List

from sentence_transformers import CrossEncoder


# Load the cross-encoder once at import time so it can be reused
# across all incoming requests.
reranker = CrossEncoder("BAAI/bge-reranker-base")


def rerank(query: str, results: List, top_k=None):
    """
    Rerank Qdrant results using a cross-encoder.

    - `results` is the list returned by `app.retrieval.retrieve`
      (typically qdrant_client.models.ScoredPoint instances).
    - We read the textual content from `payload["text"]` or `payload["rag_text"]`.
    - If `top_k` is provided, only returns top_k reranked results. Otherwise returns all results.
    """
    if not results:
        return []

    pairs = []
    filtered_results = []

    for r in results:
        payload = getattr(r, "payload", {}) or {}
        text = payload.get("text") or payload.get("rag_text")
        if not text:
            continue
        pairs.append((query, text))
        filtered_results.append(r)

    if not pairs:
        return []

    # CrossEncoder.predict returns a score per (query, text) pair.
    scores = reranker.predict(pairs)

    scored_results = list(zip(filtered_results, scores))
    scored_results.sort(key=lambda x: x[1], reverse=True)

    if top_k is not None and top_k > 0:
        scored_results = scored_results[:top_k]

    return [r for (r, _score) in scored_results]

