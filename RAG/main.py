from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.models import QueryRequest, QueryResponse, PlaceSummary
from app.retrieval import retrieve
from app.generation import build_context, generate, build_rule_based_answer
from app.routes import destinations, tourists, locals, posts, shops, vehicles
from app.auth import create_access_token, get_current_user  # get_current_user verifies JWT
from app.db import destinations_collection


def _is_missing_value(value) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        v = value.strip().lower()
        return v in {"", "n/a", "na", "none", "null", "not specified", "unspecified", "nan"}
    return False


def _detect_fact_field(query: str) -> str | None:
    """
    Detect whether the query is asking for a structured "fact" field
    that should be answered directly from MongoDB.
    """
    q = query.lower()

    fee_keywords = {"fee", "fees", "ticket", "tickets", "price", "cost", "entry fee", "admission"}
    hours_keywords = {"hours", "opening", "open", "closing", "close", "time", "times", "visiting"}
    duration_keywords = {"duration", "how long", "visit duration", "average visit"}

    if any(k in q for k in fee_keywords):
        return "entry_fee"
    if any(k in q for k in hours_keywords):
        return "opening_hours"
    if any(k in q for k in duration_keywords):
        return "average_visit_duration"

    return None


def _extract_place_hint(query: str) -> str:
    """
    Remove common question/intent words so the remainder can be used
    as a place-name hint for Mongo regex matching.
    """
    q = query.lower()
    for token in [
        "what", "is", "are", "the", "a", "an", "for", "in", "of", "to",
        "fee", "fees", "ticket", "tickets", "price", "cost", "admission",
        "opening", "open", "closing", "close", "hours", "hour", "time", "times",
        "visiting", "visit", "duration", "how", "long",
    ]:
        q = q.replace(token, " ")
    return " ".join(q.split()).strip()


async def _find_place_in_mongo_by_name_hint(name_hint: str, city: str | None = None):
    if not name_hint:
        return None

    tokens = [t for t in name_hint.split() if len(t) >= 3]
    if not tokens:
        return None

    # Match tokens in order: "abdeen palace" → /abdeen.*palace/i
    pattern = ".*".join(map(lambda t: t.replace(".", r"\."), tokens))

    mongo_filter: dict = {"name": {"$regex": pattern, "$options": "i"}}
    if city:
        mongo_filter["city"] = {"$regex": f"^{city.strip()}$", "$options": "i"}

    candidates = await destinations_collection.find(mongo_filter).to_list(length=20)
    if not candidates:
        return None

    q_tokens = set(tokens)
    best_doc = None
    best_score = -1
    for d in candidates:
        name = str(d.get("name") or "").lower()
        name_tokens = set(name.split())
        overlap = len(q_tokens & name_tokens)
        if overlap > best_score:
            best_score = overlap
            best_doc = d

    return best_doc


def _pick_place_id_from_qdrant_results(query: str, results) -> str | None:
    """
    Pick the most likely place_id from Qdrant hits, preferring name-token overlap.
    """
    q_lower = query.lower()
    q_tokens = {t for t in q_lower.replace(",", " ").split() if t}

    by_place: dict[str, list] = {}
    for r in results:
        payload = getattr(r, "payload", {}) or {}
        place_id = str(payload.get("place_id") or "")
        if not place_id:
            continue
        by_place.setdefault(place_id, []).append(r)

    if not by_place:
        return None

    def best_score(rs: list) -> float:
        return max((getattr(r, "score", 0.0) or 0.0) for r in rs)

    best_pid = None
    best = -1.0
    for pid, rs in by_place.items():
        name = str(rs[0].payload.get("name") or "").lower()
        name_tokens = {t for t in name.replace(",", " ").split() if t}
        overlap = len(q_tokens & name_tokens)
        score = overlap * 10.0 + best_score(rs)
        if score > best:
            best = score
            best_pid = pid

    return best_pid

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
async def query_rag(req: QueryRequest, current_user: str = Depends(get_current_user)):
    """
    Query RAG endpoint. Requires authentication.
    """
    # 1) Intent routing: structured fact questions should be answered directly from MongoDB.
    fact_field = _detect_fact_field(req.query)
    if fact_field:
        name_hint = _extract_place_hint(req.query)
        doc = await _find_place_in_mongo_by_name_hint(name_hint, city=req.city)

        # If Mongo lookup fails, fall back to Qdrant to identify a place_id, then fetch from Mongo by place_id.
        if doc is None:
            id_results = retrieve(
                req.query,
                top_k=max(req.limit, 15),
                wheelchair_only=req.wheelchair_only,
                city=req.city,
                category=req.category,
            )
            pid = _pick_place_id_from_qdrant_results(req.query, id_results)
            if pid:
                doc = await destinations_collection.find_one({"place_id": pid})

        if doc is not None:
            place_name = doc.get("name") or "this place"
            value = doc.get(fact_field)

            if _is_missing_value(value):
                response_text = f"The dataset does not specify {fact_field.replace('_', ' ')} for {place_name}."
            else:
                if fact_field == "entry_fee":
                    response_text = f"The entry fee for {place_name} is: {value}"
                elif fact_field == "opening_hours":
                    response_text = f"The opening hours for {place_name} are: {value}"
                elif fact_field == "average_visit_duration":
                    response_text = f"The average visit duration for {place_name} is: {value}"
                else:
                    response_text = f"{fact_field.replace('_', ' ').title()} for {place_name}: {value}"

            place_id = str(doc.get("place_id") or "")
            place_summary = PlaceSummary(
                place_id=place_id,
                name=doc.get("name"),
                category=doc.get("category"),
                city=doc.get("city"),
            )

            return QueryResponse(
                response=response_text,
                sources=[{"place_id": place_id, "field_type": fact_field}] if place_id else [],
                confidence=None,
                matched_filters={
                    "city": req.city,
                    "category": req.category,
                    "wheelchair_only": req.wheelchair_only,
                },
                places=[place_summary] if place_id else [],
            )

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

    # LLM generation (Groq). If GROQ_API_KEY isn't set, use a rule-based
    # answer that tries to be precise about specific fields like entry fees
    # or visiting hours instead of dumping raw context.
    try:
        answer = generate(req.query, context)
    except ValueError:
        answer = build_rule_based_answer(req.query, results)

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
