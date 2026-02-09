from fastapi import APIRouter, HTTPException
from ..models import Destination
from ..db import destinations_collection

router = APIRouter()

@router.post("/")
async def add_destination(destination: Destination):
    result = await destinations_collection.insert_one(destination.dict())
    return {"id": str(result.inserted_id)}

@router.get("/")
async def get_destinations():
    destinations = []
    async for d in destinations_collection.find():
        d["_id"] = str(d["_id"])
        destinations.append(d)
    return destinations

@router.get("/{place_id}")
async def get_destination(place_id: str):
    dest = await destinations_collection.find_one({"place_id": place_id})
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    dest["_id"] = str(dest["_id"])
    return dest

@router.put("/{place_id}")
async def update_destination(place_id: str, update: Destination):
    result = await destinations_collection.update_one(
        {"place_id": place_id}, {"$set": update.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Destination not found")
    return {"updated": result.modified_count}

@router.delete("/{place_id}")
async def delete_destination(place_id: str):
    result = await destinations_collection.delete_one({"place_id": place_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Destination not found")
    return {"deleted": result.deleted_count}
