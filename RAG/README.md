# Egypt Tourism RAG API (EGYReal)

Backend API for an Egypt tourism assistant that combines:

- **RAG search** over destination data stored in **MongoDB** and indexed as vectors in **Qdrant**
- **LLM answers** via **Groq** (optional, enabled by `GROQ_API_KEY`)
- **CRUD APIs** for destinations / tourists / locals / posts / shops / vehicles in **MongoDB**
- **JWT auth** to protect the RAG query endpoint

## Repo structure

```
RAG/
├─ app/
│  ├─ ingestion.py        # MongoDB → embeddings → Qdrant
│  ├─ retrieval.py        # Qdrant semantic search (+ wheelchair filter)
│  ├─ generation.py       # Groq LLM generation (optional)
│  ├─ config.py           # Settings/env vars
│  ├─ db.py               # Mongo connection + collections
│  ├─ auth.py             # JWT helpers + auth dependency
│  ├─ models.py           # Pydantic schemas
│  └─ routes/             # CRUD routers (destinations/tourists/locals/posts/shops/vehicles)
├─ scripts/
│  └─ load_excel_to_mongo.py  # optional one-time Excel → Mongo loader
├─ main.py                # Main FastAPI app (routers + /token + /query + /health)
├─ requirements.txt
└─ README.md
```

## Data model (MongoDB → Qdrant)

This project treats **MongoDB as the source of truth** for destinations/places, and uses **Qdrant only for vector search**.

### MongoDB (source of truth)

- Collection: `destinations` (DB configured by `MONGODB_DB`)
- Each document represents one place/destination and must have at least:
  - `place_id` (string, unique)
  - `name` (string)

Common fields used by RAG (stored in Mongo and partially mirrored into Qdrant payloads):

- Descriptive text used for RAG:
  - `short_description`
  - `historical_context`
  - `what_makes_it_special`
- Structured facts, kept in Mongo and **not embedded** (served directly):
  - `opening_hours`
  - `best_time_to_visit`
  - `dress_code`
  - `accessibility`
  - `traffic_and_access`
  - `average_visit_duration`
  - `entry_fee`
  - `safety_notes`
  - `local_tips`
- Plus categorical fields such as `city`, `category`, `governorate`

### Qdrant (vector index)

During vector ingestion (`app/ingestion.py: ingest_mongodb`):

- We read all destination documents from MongoDB.
- For each destination we create:
  - One **`description`** chunk combining:
    - `short_description`
    - `what_makes_it_special`
    - `historical_context`
    - `sub_category`
    - `category`
    - `tags` (rendered as `tags: tag1, tag2, ...`)
  - Zero or more **`activity`** chunks, one per entry in the `activities` list.
- Each embedded chunk is stored as a Qdrant point with:
  - `chunk_type` = `"description"` or `"activity"`
  - `field_type` mirroring the chunk type (`"description"` / `"activity"`)
  - `text` = the combined description or activity text.
- We store filterable metadata in Qdrant payload:
  - `city` and `category` are normalized to lowercase/trimmed for exact-match filters.
  - `is_wheelchair_accessible` is derived from `accessibility` as a boolean.

## Setup (local development)

### 1) Install Python dependencies

```bash
pip install -r requirements.txt
```

### 2) Start Qdrant (Docker)

```bash
docker run -p 6333:6333 -v qdrant_storage:/qdrant/storage qdrant/qdrant:latest
```

Qdrant will be available at `http://localhost:6333` (dashboard at `/dashboard`).

### 3) Start MongoDB (choose one)

**Option A: local MongoDB with Docker**

```bash
docker run -p 27017:27017 -v mongo_data:/data/db mongo:7
```

**Option B: MongoDB Atlas**

Set `MONGODB_URI` to your Atlas connection string.

### 4) Environment variables

You can set env vars in your shell or create a `.env` file (supported by `pydantic-settings`).

**Required for Qdrant + ingestion**

```bash
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=egypt_places
EMBEDDING_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
```

**Required for Mongo-backed CRUD endpoints**

```bash
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=egyreal
```

**Optional (enable LLM answers via Groq)**

```bash
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.3-70b-versatile
```

## Run the project

### 1) Ingest MongoDB destinations into Qdrant

```bash
python -c "from app.ingestion import ingest_mongodb; ingest_mongodb()"
```

### 2) Start the API server

You can run either command (they point to the same FastAPI app):

```bash
uvicorn main:app --reload
```

or:

```bash
uvicorn app.main:app --reload
```

Swagger UI will be at `http://127.0.0.1:8000/docs`.

## API overview

### Health

- `GET /health` → `{ "status": "ok" }`

### Auth

- `POST /token` (OAuth2 password flow; currently dummy user `admin/password`) → returns JWT

> Note: `app/auth.py` currently contains a placeholder `SECRET_KEY`. Set a strong secret before production.

### RAG

- `POST /query` (protected; requires `Authorization: Bearer <token>`)

#### Request body (`app.models.QueryRequest`)

**Minimal required:**

```json
{
  "query": "string"
}
```

**Full shape with optional structured filters:**

```json
{
  "query": "historical places in cairo",
  "wheelchair_only": false,
  "city": "cairo",          // optional hard filter
  "category": "museums",    // optional hard filter
  "limit": 5                // optional, defaults to 5
}
```

- **`query`** (required): raw user text, any natural-language question.
- **`wheelchair_only`** (optional, bool): if `true`, only places with `is_wheelchair_accessible = true` are eligible.
- **`city`** (optional, string): hard filter; normalized to lowercase/trimmed and matched against the `city` payload field.
- **`category`** (optional, string): hard filter; normalized and matched against the `category` payload field.
- **`limit`** (optional, int): max number of hits; controls both result count and context size.

#### Response body (`app.models.QueryResponse`)

```json
{
  "response": "string",
  "sources": [
    { "place_id": "egy_023", "field_type": "entry_fee" }
  ],
  "confidence": 0.87,
  "matched_filters": {
    "city": "cairo",
    "category": "historical",
    "wheelchair_only": false
  },
  "places": [
    {
      "place_id": "egy_023",
      "name": "Abdeen Palace",
      "category": "museums",
      "city": "cairo"
    }
  ]
}
```

- **`response`**: final, human-readable answer. If no data matches the filters, this explicitly says so (e.g. *"No matching places were found that satisfy the requested constraints..."*).
- **`sources`**: minimal provenance list for the answer; each item references the originating `place_id` and which text field was used (e.g. `entry_fee`, `opening_hours`, `short_description`).
- **`confidence`**: best similarity score returned from Qdrant (useful for UI and analytics).
- **`matched_filters`**: echo of which filters were actually applied for this query.
- **`places`**: lightweight view of the distinct places backing the answer (for cards, lists, etc.).

#### RAG pipeline behavior (high level)

At a high level, `/query` has two paths: a fast **structured-facts path** for ticket fees / opening hours / visit duration / dress code, and a general **RAG path** for everything else.

1. **Structured fact detection (Mongo-first path)**  
   - Inspect the query to see if it is clearly about:
     - `entry_fee` (tickets / price / cost),
     - `opening_hours` (opening / closing times),
     - `average_visit_duration` (how long to visit), or
     - `dress_code` (what to wear / clothing / attire).
   - If so, extract a place-name hint from the question, optionally use `city` as an extra filter, and try to find the destination **directly in MongoDB** by name.
   - If the place cannot be resolved from Mongo text search, fall back to **Qdrant** just to identify the most likely `place_id`, then fetch the full document from MongoDB using that `place_id`.
   - If a document and non-missing value are found for the detected field, answer **directly from the structured Mongo field** (skipping LLM/context building) and return a `QueryResponse` that points to that `place_id` and `field_type`.

2. **General RAG path (for all other queries or when step 1 fails)**  
   1. **Embed query** using the sentence-transformers model into a dense vector.
   2. **Apply hard filters** (`city`, `category`, `wheelchair_only`) at Qdrant level; only matching points are eligible.
   3. **Vector search** in Qdrant on the filtered subset to get top‑`k` chunks.
   4. **Build context** string from retrieved chunks (`build_context` in `app/generation.py`).
   5. **Generate answer**:
      - If `GROQ_API_KEY` is set, call Groq and ask it to answer *only* from the provided context.
      - If not, fall back to a rule-based answer that:
        - Tries to pick the place whose name best matches the query (e.g. “Abdeen Palace”).
        - For fee/time questions, answers from the specific fields (`entry_fee`, `opening_hours`, `average_visit_duration`, etc.) for that place if present.
        - Otherwise, summarizes the most relevant chunks for that place.
   6. If **no points match the filters**, the API returns a safe, explicit “no results” message with an empty `sources` array instead of guessing.

### CRUD routers (MongoDB)

These are mounted under:

- `/destinations`
- `/tourists`
- `/locals`
- `/posts`
- `/shops`
- `/vehicles`

They use Pydantic models in `app/models.py` and store data in MongoDB collections defined in `app/db.py`.

## Notes / gotchas

- **Ingestion must run before meaningful RAG queries** (so Qdrant has vectors).
- Qdrant point IDs must be UUID/uint — ingestion uses UUIDs.
- Never commit secrets. Put credentials in env vars / `.env` (and add `.env` to `.gitignore`).
