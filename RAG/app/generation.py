from typing import Any, Iterable

from groq import Groq

from app.config import get_settings


def build_context(results: Iterable[Any], max_places: int = 5) -> str:
    """
    Build context using top unique places only.
    """

    context = []
    seen_places = set()

    for r in results:
        payload = r.payload

        place_id = payload.get("place_id")
        if place_id in seen_places:
            continue

        seen_places.add(place_id)

        field_type = str(payload.get("field_type", "")).upper()
        name = payload.get("name", "")
        text = payload.get("text", "")

        context.append(f"[{field_type}] {name}: {text}")

        if len(seen_places) >= max_places:
            break

    print(f"Built context from {len(context)} unique places")
    #print("\n".join(context))   
    return "\n".join(context)


def generate(query: str, context: str) -> str:
    """
    Generate response using LLM via Groq (e.g. Llama 3.3).
    """
    print("Getting settings for Groq client...")
    #settings = get_settings()
    print("settings")
    
    print("Initializing Groq client...")
    client = Groq(api_key="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")
    print("Groq client initialized.")
    prompt = f"""
        You are an assistant for an Egypt tourism system.

        You will receive context containing EXACTLY 5 places retrieved from a RAG system.

        STRICT RULES:
        - You MUST consider all 5 places.
        - You MUST NOT use any external knowledge.
        - If information is missing in the context, say "Not available in provided data."
        - Do NOT invent facts.
        - If the question is about a specific field (opening hours, safety, tips, duration, best time), extract ONLY that field from each place.
        - If the question is about recommendations (e.g. "where should I go"), compare the 5 places and explain briefly why each is relevant.

        Context:
        {context}

        User Question:
        {query}

        Return your answer in this format:

        For recommendation queries:
        1. Place Name – Short reason why it matches the query.
        2. Place Name – Short reason.
        3. Place Name – Short reason.
        4. Place Name – Short reason.
        5. Place Name – Short reason.

        For factual queries:
        Place Name:
        - Requested information only.

        Answer:
        """
    # print(f"Groq prompt:\n\n\n\n{prompt}")
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that answers questions about Egyptian places and locations using only the provided context.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
        max_tokens=1000,
    )
    print(f"Groq response: {response.choices[0].message.content.strip()}")
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

    # Since results are already reranked, use the first result's place
    # Group results by place_id to collect all fields for that place
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

    # Use the first place from reranked results (already sorted by relevance)
    first_result = results[0]
    first_payload = getattr(first_result, "payload", {}) or {}
    top_place_id = str(first_payload.get("place_id") or "")
    
    if not top_place_id:
        # Fallback to context if no place_id
        return f"ANSWER BASED ON:\n{build_context(results)}"

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
