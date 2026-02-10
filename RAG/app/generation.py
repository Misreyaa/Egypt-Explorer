from groq import Groq
from app.config import get_settings


def build_context(results):
    context = []

    for r in results:
        payload = r.payload
        context.append(
            f"[{payload['field_type'].upper()}] "
            f"{payload['name']}: {payload['text']}"
        )

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
