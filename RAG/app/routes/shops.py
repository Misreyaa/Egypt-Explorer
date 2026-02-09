from fastapi import APIRouter, HTTPException
from ..models import Shop
from ..db import shops_collection

router = APIRouter()

@router.post("/")
async def add_shop(shop: Shop):
    result = await shops_collection.insert_one(shop.dict())
    return {"id": str(result.inserted_id)}

@router.get("/")
async def get_shops():
    shops = []
    async for s in shops_collection.find():
        s["_id"] = str(s["_id"])
        shops.append(s)
    return shops

@router.get("/{shop_id}")
async def get_shop(shop_id: str):
    shop = await shops_collection.find_one({"shop_id": shop_id})
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    shop["_id"] = str(shop["_id"])
    return shop

@router.put("/{shop_id}")
async def update_shop(shop_id: str, shop: Shop):
    result = await shops_collection.update_one({"shop_id": shop_id}, {"$set": shop.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Shop not found")
    return {"updated": result.modified_count}

@router.delete("/{shop_id}")
async def delete_shop(shop_id: str):
    result = await shops_collection.delete_one({"shop_id": shop_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Shop not found")
    return {"deleted": result.deleted_count}
