from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.models import QueryRequest, QueryResponse, PlaceSummary
from app.retrieval import retrieve
from app.generation import build_context, generate
from app.routes import destinations, tourists, locals, posts, shops, vehicles
from app.auth import create_access_token, get_current_user  # get_current_user verifies JWT

# -----------------------------
# FastAPI App Initialization
# -----------------------------
app = FastAPI(
    title="Egypt Tourism RAG",
    description="API for destinations, tourists, locals, posts, shops, and vehicles",
    version="1.0.0"
)


@app.get("/health")
def health():
    return {"status": "ok"}

# -----------------------------
# Token Endpoint for Login
# -----------------------------
@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Dummy authentication: replace with your user DB check
    if form_data.username != "admin" or form_data.password != "password":
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}


# -----------------------------
# Include Routers
# -----------------------------
# If you want to protect all routes under a router, add dependencies=[Depends(get_current_user)]
app.include_router(destinations.router, prefix="/destinations", tags=["Destinations"])
app.include_router(tourists.router, prefix="/tourists", tags=["Tourists"])
app.include_router(locals.router, prefix="/locals", tags=["Locals"])
app.include_router(posts.router, prefix="/posts", tags=["Posts"])
app.include_router(shops.router, prefix="/shops", tags=["Shops"])
app.include_router(vehicles.router, prefix="/vehicles", tags=["Vehicles"])

# -----------------------------
# Protected Query Endpoint
# -----------------------------
@app.post("/query", response_model=QueryResponse)
def query_rag(req: QueryRequest, current_user: str = Depends(get_current_user)):
    """
    Query RAG endpoint. Requires authentication.
    """
    results = retrieve(
        req.query,
        top_k=req.limit,
        wheelchair_only=req.wheelchair_only,
        city=req.city,
        category=req.category,
    )

    # Guardrail: if filters eliminate everything, be honest instead of fabricating
    if not results:
        return QueryResponse(
            response=(
                "No matching places were found that satisfy the requested constraints "
                "(city/category/accessibility)."
            ),
            sources=[],
            confidence=None,
            matched_filters={
                "city": req.city,
                "category": req.category,
                "wheelchair_only": req.wheelchair_only,
            },
            places=[],
        )

    context = build_context(results)

    # LLM generation (Groq). If GROQ_API_KEY isn't set, fall back to returning context.
    try:
        answer = generate(req.query, context)
    except ValueError:
        answer = f"ANSWER BASED ON:\n{context}"

    # Build source list and lightweight place summaries
    sources = []
    place_map: dict[str, PlaceSummary] = {}

    for r in results:
        payload = r.payload
        place_id = payload.get("place_id")
        if place_id is None:
            continue

        sources.append(
            {
                "place_id": place_id,
                "field_type": payload.get("field_type"),
            }
        )

        if place_id not in place_map:
            place_map[place_id] = PlaceSummary(
                place_id=place_id,
                name=payload.get("name"),
                category=payload.get("category"),
                city=payload.get("city"),
            )

    # Confidence = best similarity score from Qdrant (if available)
    confidence = max((getattr(r, "score", None) or 0.0) for r in results) if results else None

    return QueryResponse(
        response=answer,
        sources=sources,
        confidence=confidence,
        matched_filters={
            "city": req.city,
            "category": req.category,
            "wheelchair_only": req.wheelchair_only,
        },
        places=list(place_map.values()),
    )
