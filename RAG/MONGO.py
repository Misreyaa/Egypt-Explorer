import asyncio
from app.db import destinations_collection

async def test():
    try:
        doc = await destinations_collection.find_one()
        if doc:
            print("MongoDB connected, found document:", doc)
        else:
            print("MongoDB connected, but no documents found")
    except Exception as e:
        print("MongoDB connection failed:", e)

asyncio.run(test())
