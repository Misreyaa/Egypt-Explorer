from typing import List

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from ..models import Tourist
from ..db import tourists_collection, destinations_collection, locals_collection
from ..auth import create_access_token, get_current_user
from ..auth_models import TouristSignupRequest, LoginRequest
from ..utils import hash_password, verify_password

router = APIRouter()


@router.put("/{email}")
async def update_tourist(
    email: str,
    update: Tourist,
    current_user: str = Depends(get_current_user)
):
    # Only allow the authenticated user to update their own account
    if current_user != email:
        raise HTTPException(status_code=403, detail="Not allowed to update this user")

    result = await tourists_collection.update_one(
        {"email": email}, {"$set": update.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tourist not found")
    return {"updated": result.modified_count}

# ----------------- Delete Tourist -----------------
@router.delete("/{email}")
async def delete_tourist(
    email: str,
    current_user: str = Depends(get_current_user)
):
    # Only allow the authenticated user to delete their own account
    if current_user != email:
        raise HTTPException(status_code=403, detail="Not allowed to delete this user")

    result = await tourists_collection.delete_one({"email": email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tourist not found")
    return {"deleted": result.deleted_count}

# ----------------- Matching Endpoints -----------------
@router.get("/{username}/match_destinations")
async def match_destinations(
    username: str,
    current_user: str = Depends(get_current_user)
):
    if current_user != username:
        raise HTTPException(status_code=403, detail="Not allowed to view this user's matches")

    tourist = await tourists_collection.find_one({"username": username})
    if not tourist:
        raise HTTPException(status_code=404, detail="Tourist not found")
    matched = await destinations_collection.find({
        "tags": {"$in": tourist.get("preferences", [])}
    }).to_list(length=50)
    return matched


@router.get("/{email}/match_locals")
async def match_locals(
    email: str,
    current_user: str = Depends(get_current_user)
):
    if current_user != email:
        raise HTTPException(status_code=403, detail="Not allowed to view this user's matches")

    tourist = await tourists_collection.find_one({"email": email})
    if not tourist:
        raise HTTPException(status_code=404, detail="Tourist not found")

    # Get locals that share at least one language or interest (optional, can return all locals)
    locals_cursor = locals_collection.find()
    locals_list = await locals_cursor.to_list(length=100)

    # Transform data to match frontend expectation
    matched_locals = []
    for local in locals_list:
        matched_locals.append({
            "id": str(local.get("_id")),
            "name": local.get("name"),
            "age": str(local.get("age")),
            "city": local.get("city"),
            "occupation": local.get("occupation"),
            "bio": local.get("bio"),
            "avatarUrl": local.get("avatarUrl"),
            "spoken_languages": local.get("spoken_languages", []),
            "interests": local.get("interests", []),
            "rating": local.get("rating", 0),
            "reviewCount": local.get("reviewCount", 0)
        })
    return matched_locals

class WishlistRequest(BaseModel):
    destination_id: str
    email:str

@router.post("/add_to_wishlist")
async def add_to_wishlist(req: WishlistRequest):
    # 1️⃣ Find the tourist by email
    tourist = await tourists_collection.find_one(req.email)
    if not tourist:
        raise HTTPException(status_code=404, detail="Tourist not found")

    # 2️⃣ Initialize wishlist if it doesn't exist
    wishlist: List[str] = tourist.get("wishlist", [])

    # 3️⃣ Avoid duplicates
    if req.destination_id in wishlist:
        return {"message": "Destination already in wishlist", "wishlist": wishlist}

    # 4️⃣ Add the new destination
    wishlist.append(req.destination_id)

    # 5️⃣ Update the DB
    await tourists_collection.update_one(
        {"email": req.email},
        {"$set": {"wishlist": wishlist}}
    )

    return {"message": "Destination added to wishlist", "wishlist": wishlist}
