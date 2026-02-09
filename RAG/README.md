# RAG Application

Retrieval-Augmented Generation (RAG) application using Excel data, Qdrant vector database, and OpenAI.

## Architecture

```
rag_app/
├── app/
│   ├── main.py              # FastAPI entrypoint
│   ├── config.py            # Environment variables + constants
│   ├── models.py            # Pydantic schemas
│   ├── ingestion.py         # Excel → embeddings → Qdrant
│   ├── retrieval.py         # Semantic search + filters
│   ├── generation.py        # LLM prompt + response
│   └── utils.py             # Utility functions
├── data/
│   └── Categorized_Locations.xlsx
├── requirements.txt
└── README.md
```

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file or set the following environment variables:

```bash
# Qdrant Configuration
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_api_key_optional
QDRANT_COLLECTION=rag_collection

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# Embedding Model
EMBEDDING_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2

# Data Path
EXCEL_FILE_PATH=data/Categorized_Locations.xlsx

# RAG Settings (optional)
TOP_K=5
CHUNK_SIZE=500
CHUNK_OVERLAP=50
```

### 3. Start Qdrant

You can run Qdrant locally using Docker:

```bash
docker run -p 6333:6333 qdrant/qdrant
```

Or use Qdrant Cloud (update `QDRANT_URL` and `QDRANT_API_KEY` accordingly).

### 4. Prepare Data

Place your Excel file (`Categorized_Locations.xlsx`) in the `data/` directory.

## Usage

### Data Ingestion

Ingest Excel data into Qdrant:

**Option 1: Via API**
```bash
curl -X POST http://localhost:8000/ingest
```

**Option 2: Via Python script**
```bash
python -m app.ingestion
```

This will:
- Load the Excel file
- Convert rows to documents
- Chunk documents (if needed)
- Generate embeddings
- Upload to Qdrant

### Running the API

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### Querying

**Health Check:**
```bash
curl http://localhost:8000/health
```

**RAG Query:**
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What locations are available?",
    "top_k": 5
  }'
```

**Query with Filters:**
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Find locations in a specific category",
    "top_k": 5,
    "filters": {
      "Category": "Restaurants"
    }
  }'
```

## API Endpoints

### `GET /health`
Health check endpoint.

### `POST /ingest`
Ingest Excel data into Qdrant vector database.

**Response:**
```json
{
  "status": "success",
  "documents_processed": 100,
  "collection_name": "rag_collection",
  "message": "Successfully ingested 100 chunks into Qdrant"
}
```

### `POST /query`
Query the RAG system.

**Request:**
```json
{
  "query": "Your question here",
  "top_k": 5,
  "filters": {
    "column_name": "value"
  }
}
```

**Response:**
```json
{
  "answer": "Generated answer based on context",
  "sources": [
    {
      "id": "uuid",
      "text": "Document text",
      "metadata": {...},
      "score": 0.95
    }
  ],
  "query": "Your question here"
}
```

## Components

### `app/ingestion.py`
- Loads Excel files using pandas
- Converts rows to documents with metadata
- Chunks documents (configurable)
- Generates embeddings using sentence-transformers
- Uploads to Qdrant vector database

### `app/retrieval.py`
- Semantic search using Qdrant
- Supports filtering by metadata fields
- Returns ranked documents with scores

### `app/generation.py`
- Builds context from retrieved documents
- Constructs RAG prompts
- Generates answers using OpenAI API
- Returns answers with source citations

### `app/models.py`
- Pydantic models for request/response validation
- `QueryRequest`, `QueryResponse`, `Document`, `IngestionResponse`

### `app/utils.py`
- Text cleaning and normalization
- Text chunking utilities
- Embedding model loading

## Customization

- **Chunking Strategy**: Modify `chunk_text()` in `app/utils.py`
- **Prompt Engineering**: Update `build_prompt()` in `app/generation.py`
- **Embedding Model**: Change `EMBEDDING_MODEL_NAME` in config
- **LLM Model**: Change `OPENAI_MODEL` in config
- **Filters**: Add custom filter logic in `app/retrieval.py`

## Notes

- Ensure Qdrant is running before ingesting data or querying
- The Excel file should be placed in `data/` directory
- First run ingestion before querying
- Adjust `CHUNK_SIZE` and `CHUNK_OVERLAP` based on your data characteristics
