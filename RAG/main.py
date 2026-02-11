import re

import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.models import QueryRequest, QueryResponse, PlaceSummary


from app.retrieval import retrieve
from app.reranker import rerank

from app.generation import build_context, generate, build_rule_based_answer

from app.routes import destinations, tourists, locals, posts, shops, vehicles

from app.auth import create_access_token, get_current_user  # get_current_user verifies JWT

from app.db import destinations_collection
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]


def _is_missing_value(value) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        v = value.strip().lower()
        return v in {"", "n/a", "na", "none", "null", "not specified", "unspecified", "nan"}
    return False


def _parse_time_range_from_query(query: str) -> tuple[int, int] | None:
    """
    Very simple time-range extractor for queries like:
    - "open from 8 to 17"
    - "open between 10 and 22"

    We look for 2 integers in the range [0, 23] and interpret them as 24‑hour
    clock hours, then convert to minutes.
    """
    numbers = [int(m.group()) for m in re.finditer(r"\d{1,2}", query)]
    numbers = [n for n in numbers if 0 <= n <= 23]
    if len(numbers) < 2:
        return None

    start_hour = min(numbers[0], numbers[1])
    end_hour = max(numbers[0], numbers[1])

    start_minutes = start_hour * 60
    end_minutes = end_hour * 60
    return start_minutes, end_minutes


def _format_hour(minutes: int) -> str:
    """Format minutes since midnight into a simple HH:MM string."""
    h = minutes // 60
    m = minutes % 60
    return f"{h:02d}:{m:02d}"


def _detect_fact_field(query: str) -> str | None:
    """
    Detect whether the query is asking for a structured "fact" field
    that should be answered directly from MongoDB.
    """
    q = query.lower()

    fee_keywords = {"fee", "fees", "ticket", "tickets", "price", "cost", "entry fee", "admission"}
    hours_keywords = {"hours", "opening", "open", "closing", "close", "time", "times", "visiting"}
    duration_keywords = {"duration", "how long", "visit duration", "average visit"}
    safety_keywords = {"safety", "safe", "dangerous", "security"}
    tips_keywords = {"tips", "tricks", "local tips", "advice", "recommendations"}
    dress_keywords = {
        "dress code",
        "dress",
        "wear",
        "what to wear",
        "clothes",
        "clothing",
        "attire",
    }

    if any(k in q for k in fee_keywords):
        return "entry_fee"
    if any(k in q for k in hours_keywords):
        return "opening_hours"
    if any(k in q for k in duration_keywords):
        return "average_visit_duration"
    if any(k in q for k in safety_keywords):
        return "safety_notes"
    if any(k in q for k in tips_keywords):
        return "local_tips"
    if any(k in q for k in dress_keywords):
        return "dress_code"

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
        "dress", "code", "wear", "clothes", "clothing", "attire",
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


def _looks_like_activity_intent(query: str) -> bool:
    """
    Heuristic check for activity-oriented queries.
    """
    q = query.lower()
    activity_keywords = [
        "activity",
        "activities",
        "things to do",
        "i love",
        "i like",
        "i want to do",
        "adventure",
        "hiking",
        "water",
        "snorkel",
        "snorkeling",
        "diving",
        "swim",
        "photography",
    ]
    return any(k in q for k in activity_keywords)

# -----------------------------
# FastAPI App Initialization
# -----------------------------
app = FastAPI(
    title="Egypt Tourism RAG",
    description="API for destinations, tourists, locals, posts, shops, and vehicles",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("hello")
def hello():
    print("hello has been invoced")
    return {"response": "hello"}

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
    # 0) Time-range intent: "open between X and Y" → Mongo numeric filter on open/close minutes.
    time_range = _parse_time_range_from_query(req.query)
    if time_range is not None:
        user_start, user_end = time_range

        # A place is considered available if its open/close window overlaps
        # the requested window at all.
        mongo_filter: dict = {
            "open_minutes": {"$lte": user_end},
            "close_minutes": {"$gte": user_start},
        }
        if req.city:
            mongo_filter["city"] = {"$regex": f"^{req.city.strip()}$", "$options": "i"}
        if req.category:
            mongo_filter["category"] = {"$regex": f"^{req.category.strip()}$", "$options": "i"}
        if req.wheelchair_only:
            mongo_filter["is_wheelchair_accessible"] = True

        docs = await destinations_collection.find(mongo_filter).to_list(length=50)

        if not docs:
            response_text = (
                "No places were found that are open between "
                f"{_format_hour(user_start)} and {_format_hour(user_end)} "
                "for the requested constraints."
            )
            return QueryResponse(
                response=response_text,
                sources=[],
                confidence=None,
                matched_filters={
                    "city": req.city,
                    "category": req.category,
                    "wheelchair_only": req.wheelchair_only,
                },
                places=[],
            )

        # Format a deterministic list-style response; no LLM involved.
        lines = [
            f"The following places are open between {_format_hour(user_start)} and {_format_hour(user_end)}:",
        ]
        places: list[PlaceSummary] = []
        for d in docs:
            name = d.get("name") or "Unnamed place"
            city = d.get("city")
            category = d.get("category")
            pid = str(d.get("place_id") or "")

            open_m = d.get("open_minutes")
            close_m = d.get("close_minutes")
            if isinstance(open_m, int) and isinstance(close_m, int):
                hours_str = f"{_format_hour(open_m)}–{_format_hour(close_m)}"
            else:
                hours_str = "hours not specified"

            if city:
                lines.append(f"- {name} ({city}) — {hours_str}")
            else:
                lines.append(f"- {name} — {hours_str}")

            if pid:
                places.append(
                    PlaceSummary(
                        place_id=pid,
                        name=name,
                        category=category,
                        city=city,
                    )
                )

        return QueryResponse(
            response="\n".join(lines),
            sources=[],
            confidence=None,
            matched_filters={
                "city": req.city,
                "category": req.category,
                "wheelchair_only": req.wheelchair_only,
            },
            places=places,
        )

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
                chunk_type="description",
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
                elif fact_field == "dress_code":
                    response_text = f"The dress code for {place_name} is: {value}"
                elif fact_field == "safety_notes":
                    response_text = f"Safety notes for {place_name}: {value}"
                elif fact_field == "local_tips":
                    response_text = f"Local tips for {place_name}: {value}"
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

    # 2) Activity‑focused vs general description search
    chunk_type = "activity" if _looks_like_activity_intent(req.query) else "description"

    # Retrieve a wider candidate set, then rerank down to the requested limit.
    initial_k = max(req.limit, 20)
    results = retrieve(
        req.query,
        top_k=initial_k,
        wheelchair_only=req.wheelchair_only,
        city=req.city,
        category=req.category,
        chunk_type=chunk_type,
    )

    # Cross-encoder reranking (only for semantic search paths).
    results = rerank(req.query, results, top_k=req.limit)

    # Guardrail: if filters eliminate everything, be honest instead of fabricating
    if not results:
        # Special honesty for water‑activity queries with no supporting data.
        if chunk_type == "activity" and "water" in req.query.lower():
            no_water_msg = (
                "No strong water-based activities were found in this dataset for the given filters. "
                "You may want to consider coastal destinations such as Hurghada or Sharm El Sheikh, "
                "which are better known for water activities."
            )
            return QueryResponse(
                response=no_water_msg,
                sources=[],
                confidence=None,
                matched_filters={
                    "city": req.city,
                    "category": req.category,
                    "wheelchair_only": req.wheelchair_only,
                },
                places=[],
            )

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

    # If user asked about water activities but none of the retrieved activity chunks
    # actually mention water, be explicit instead of hallucinating.
    if chunk_type == "activity" and "water" in req.query.lower():
        has_water_activity = any(
            "water" in str(getattr(r, "payload", {}).get("text", "")).lower()
            for r in results
        )
        if not has_water_activity:
            no_water_msg = (
                "No strong water-based activities were found in this dataset for the given filters. "
                "You may want to consider coastal destinations such as Hurghada or Sharm El Sheikh, "
                "which are better known for water activities."
            )
            return QueryResponse(
                response=no_water_msg,
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
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8080)

