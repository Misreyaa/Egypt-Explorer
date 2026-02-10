# app/__init__.py
"""
Minimal package init for the RAG app.

We intentionally do NOT import legacy route/db/auth modules here,
so that `from app.ingestion import ingest_excel` does not pull in
unrelated dependencies.
"""

from .models import QueryRequest, QueryResponse  # noqa: F401
from .retrieval import retrieve  # noqa: F401
from .generation import build_context  # noqa: F401

