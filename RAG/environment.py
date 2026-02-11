import os

# Local Qdrant via Docker (no API key needed)

# If an API key was previously set in this process, clear it for local usage
os.environ.pop("QDRANT_API_KEY", None)