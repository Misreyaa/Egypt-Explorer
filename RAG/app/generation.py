from typing import Any, Iterable

from groq import Groq

from app.config import get_settings


def build_context(results: Iterable[Any]) -> str:
    """
    Build a human-readable context string from Qdrant search results.
    """
    context = []

    for r in results:
        payload = r.payload
        field_type = str(payload.get("field_type", "")).upper()
        name = payload.get("name", "")
        text = payload.get("text", "")
        context.append(f"[{field_type}] {name}: {text}")

    return "\n".join(context)


def generate(query: str, context: str) -> str:
    """
    Generate response using LLM via Groq (e.g. Llama 3.3).
    """
    settings = get_settings()

    if not settings.groq_api_key:
        raise ValueError("GROQ_API_KEY must be set in environment variables")

    client = Groq(api_key=settings.groq_api_key)

    prompt = f"""You are a helpful assistant that answers questions about Egyptian places and locations.

Context:
{context}

Question: {query}

Please provide a concise, helpful answer based only on the context above. If the context doesn't contain enough information, say that you don't know.

Answer:"""

    response = client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that answers questions about Egyptian places and locations using only the provided context.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=1000,
    )

    return response.choices[0].message.content.strip()


def build_rule_based_answer(query: str, results: Iterable[Any]) -> str:
    """
    Deterministic fallback when no Groq API key is set.

    - If the query looks like it's asking about fees/hours for a specific place,
      try to answer using only that place's fields (e.g. `entry_fee`, `opening_hours`).
    - If the dataset doesn't contain that field for the place, say so explicitly.
    - Otherwise, fall back to summarizing the best-matching chunks.
    """
    results = list(results)
    if not results:
        return "No places were found for this query."

    q_lower = query.lower()

    # Group results by place_id
    by_place: dict[str, list[Any]] = {}
    for r in results:
        payload = getattr(r, "payload", {}) or {}
        place_id = str(payload.get("place_id") or "")
        if not place_id:
            continue
        by_place.setdefault(place_id, []).append(r)

    if not by_place:
        # No place_ids in payloads; just dump context
        return f"ANSWER BASED ON:\n{build_context(results)}"

    def best_score(rs: list[Any]) -> float:
        return max((getattr(r, "score", 0.0) or 0.0) for r in rs)

    # Try to find a place whose name overlaps most strongly with the query tokens.
    # This strongly prefers specific matches like "Abdeen Palace" over generic
    # matches like "The Manial Palace Museum" when the user says "Abdeen Palace".
    q_tokens = {t for t in q_lower.replace(",", " ").split() if t}
    name_matched_place_id: str | None = None
    best_name_score = -1.0

    for place_id, rs in by_place.items():
        payload = rs[0].payload
        name = str(payload.get("name") or "").lower()
        if not name:
            continue

        name_tokens = {t for t in name.replace(",", " ").split() if t}
        overlap = q_tokens & name_tokens
        if not overlap:
            continue

        # Score = number of overlapping tokens (strong signal) + similarity score.
        score = len(overlap) * 10.0 + best_score(rs)
        if score > best_name_score:
            best_name_score = score
            name_matched_place_id = place_id

    # If we found a good name match, focus answers on it; otherwise pick best overall.
    if name_matched_place_id is not None:
        top_place_id = name_matched_place_id
    else:
        top_place_id = max(by_place.items(), key=lambda kv: best_score(kv[1]))[0]

    top_results = by_place[top_place_id]
    top_payload = top_results[0].payload
    place_name = top_payload.get("name", "this place")

    # Index fields by type for the top place
    fields: dict[str, list[str]] = {}
    for r in top_results:
        p = r.payload
        f_type = str(p.get("field_type") or "")
        text = str(p.get("text") or "").strip()
        if f_type and text:
            fields.setdefault(f_type, []).append(text)

    # Simple intent detection based on query words
    q_words = set(q_lower.split())
    wants_fee = any(w in q_words for w in {"fee", "fees", "ticket", "price", "cost", "entry fee", "admission", "entry fees", "admission fees", "entry ticket", "admission ticket", "entry price", "admission price", "entry cost", "admission cost", "entry fee", "admission fee", "entry ticket", "admission ticket", "entry price", "admission price", "entry cost", "admission cost"})
    wants_hours = any(w in q_words for w in {"hours", "opening", "closing", "time", "times", "opening hours", "closing hours", "opening time", "closing time", "visit duration", "average visit duration", "opens", "closes", "open", "close"})

    if wants_fee:
        fee_texts = fields.get("entry_fee") or fields.get("entry fees") or fields.get("fees")
        if fee_texts:
            # Use the first fee description for this place
            return f"The entry fee for {place_name} is: {fee_texts[0]}"
        # No explicit fee info for this place
        extra = fields.get("short_description") or fields.get("historical_context")
        if extra:
            return (
                f"The dataset does not specify an entry fee for {place_name}. "
                f"Here is some related information: {extra[0]}"
            )
        return f"The dataset does not specify an entry fee for {place_name}."

    if wants_hours:
        hours_texts = fields.get("opening_hours") or fields.get("best_time_to_visit")
        if hours_texts:
            return f"The visiting/opening hours for {place_name} are: {hours_texts[0]}"
        extra = fields.get("short_description") or fields.get("historical_context")
        if extra:
            return (
                f"The dataset does not specify visiting hours for {place_name}. "
                f"Here is some related information: {extra[0]}"
            )
        return f"The dataset does not specify visiting hours for {place_name}."

    # Generic fallback: summarize context for top place only
    context_lines = []
    for f_type, texts in fields.items():
        for t in texts:
            context_lines.append(f"[{f_type.upper()}] {place_name}: {t}")

    if not context_lines:
        return "No detailed information is available for this place in the dataset."

    return "ANSWER BASED ON:\n" + "\n".join(context_lines)
