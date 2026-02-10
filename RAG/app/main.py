"""
ASGI entrypoint.

We re-export the main FastAPI app defined in the repository root `main.py`
so you can run:

    uvicorn app.main:app --reload
"""

from main import app  # noqa: F401
