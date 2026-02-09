from openai import OpenAI
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
    Generate response using LLM (OpenAI by default, can be swapped for Gemini, Groq, etc.).
    """
    settings = get_settings()
    
    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY must be set in environment variables")
    
    client = OpenAI(api_key=settings.openai_api_key)
    
    prompt = f"""You are a helpful assistant that answers questions about Egyptian places and locations.

Context:
{context}

Question: {query}

Please provide a comprehensive answer based on the context above. If the context doesn't contain enough information, please say so.

Answer:"""
    
    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": "You are a helpful assistant that answers questions about Egyptian places and locations."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=1000
    )
    
    return response.choices[0].message.content.strip()
