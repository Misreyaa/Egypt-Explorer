import os

from motor.motor_asyncio import AsyncIOMotorClient

# NOTE:
# - Do NOT hardcode credentials in source code.
# - Provide your Mongo connection string via environment variables.
#   e.g. for Atlas:
#   MONGODB_URI="mongodb+srv://user:pass@cluster0.byznfgr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
#   MONGODB_DB="egyreal"

EXCEL_PATH = "data/Locations.xlsx"

# Use env vars, defaulting to cloud MongoDB Atlas cluster
MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://mariamelkondakly88_db_user:VXNPTFlECyywG3F5@cluster0.byznfgr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
)
MONGODB_DB = os.getenv("MONGODB_DB", "egyreal")

# Async Motor client ("mongo await" style)
client: AsyncIOMotorClient = AsyncIOMotorClient(MONGODB_URI)
db = client[MONGODB_DB]

# Collections (async Motor collections; use `await` on operations, not on `db` itself)
destinations_collection = db["destinations"]
tourists_collection = db["tourists"]
locals_collection = db["locals"]
posts_collection = db["posts"]
shops_collection = db["shops"]
vehicles_collection = db["vehicles"]