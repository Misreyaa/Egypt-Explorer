# Egypt Tourism RAG API (EGYReal)

Backend API for an Egypt tourism assistant that combines:

- **RAG search** over an Excel dataset stored in **Qdrant** (vector DB)
- **LLM answers** via **Groq** (optional, enabled by `GROQ_API_KEY`)
- **CRUD APIs** for destinations / tourists / locals / posts / shops / vehicles in **MongoDB**
- **JWT auth** to protect the RAG query endpoint

## Repo structure

```
RAG/
├─ app/
│  ├─ ingestion.py        # Excel → embeddings → Qdrant
│  ├─ retrieval.py        # Qdrant semantic search (+ wheelchair filter)
│  ├─ generation.py       # Groq LLM generation (optional)
│  ├─ config.py           # Settings/env vars
│  ├─ db.py               # Mongo connection + collections
│  ├─ auth.py             # JWT helpers + auth dependency
│  ├─ models.py           # Pydantic schemas
│  └─ routes/             # CRUD routers (destinations/tourists/locals/posts/shops/vehicles)
├─ data/
│  └─ Categorized_Locations.xlsx
├─ main.py                # Main FastAPI app (routers + /token + /query + /health)
├─ requirements.txt
└─ README.md
```

## Data used (`data/Categorized_Locations.xlsx`)

This project uses an Excel file containing Egyptian locations/destinations. During ingestion (`app/ingestion.py`):

- Column names are normalized: **lowercased** and spaces replaced with underscores.
- Each row becomes one “place”, identified by `place_id` and `name`.
- Two text fields are embedded (if present) and stored in Qdrant as separate points:
  - `short_description` → stored with `field_type="description"`
  - `what_makes_it_special` → stored with `field_type="significance"`

**Minimum columns expected by ingestion**

- `place_id`
- `name`

**Optional columns used as metadata payload in Qdrant**

- `category`
- `accessibility`
- `short_description`
- `what_makes_it_special`

If you add more columns and want them searchable, extend the `chunks` list in `app/ingestion.py`.

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

### 1) Ingest the Excel file into Qdrant

```bash
python -c "from app.ingestion import ingest_excel; ingest_excel('data/Categorized_Locations.xlsx')"
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

Request body (`app.models.QueryRequest`):

```json
{ "query": "string", "wheelchair_only": false }
```

Response (`app.models.QueryResponse`):

```json
{ "response": "string", "sources": [ { "place_id": "…", "field_type": "…" } ] }
```

Behavior:

- Retrieves top matches from Qdrant (`app/retrieval.py`)
- Builds a context string (`app/generation.py: build_context`)
- If `GROQ_API_KEY` is set, generates a final answer via Groq; otherwise returns a fallback answer based on context

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
