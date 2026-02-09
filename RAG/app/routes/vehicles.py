from fastapi import APIRouter, HTTPException
from ..models import Vehicle
from ..db import vehicles_collection

router = APIRouter()

@router.post("/")
async def add_vehicle(vehicle: Vehicle):
    result = await vehicles_collection.insert_one(vehicle.dict())
    return {"id": str(result.inserted_id)}

@router.get("/")
async def get_vehicles():
    vehicles = []
    async for v in vehicles_collection.find():
        v["_id"] = str(v["_id"])
        vehicles.append(v)
    return vehicles

@router.get("/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    v = await vehicles_collection.find_one({"vehicle_id": vehicle_id})
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    v["_id"] = str(v["_id"])
    return v

@router.put("/{vehicle_id}")
async def update_vehicle(vehicle_id: str, vehicle: Vehicle):
    result = await vehicles_collection.update_one({"vehicle_id": vehicle_id}, {"$set": vehicle.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"updated": result.modified_count}

@router.delete("/{vehicle_id}")
async def delete_vehicle(vehicle_id: str):
    result = await vehicles_collection.delete_one({"vehicle_id": vehicle_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"deleted": result.deleted_count}
