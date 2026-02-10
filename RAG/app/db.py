import os

from motor.motor_asyncio import AsyncIOMotorClient

# NOTE:
# - Do NOT hardcode credentials in source code.
# - Provide your Mongo connection string via environment variables.
#
# Examples:
#   MONGODB_URI=mongodb://localhost:27017
#   MONGODB_DB=egyreal
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "egyreal")

client = AsyncIOMotorClient(MONGODB_URI)
db = client[MONGODB_DB]

# Collections
destinations_collection = db["destinations"]
tourists_collection = db["tourists"]
locals_collection = db["locals"]
posts_collection = db["posts"]
shops_collection = db["shops"]
vehicles_collection = db["vehicles"]