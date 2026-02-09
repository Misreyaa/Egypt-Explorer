from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.models import QueryRequest, QueryResponse
from app.retrieval import retrieve
from app.generation import build_context
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
