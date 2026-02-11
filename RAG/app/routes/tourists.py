from fastapi import APIRouter, HTTPException, Depends
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
    matched = await locals_collection.find({
        "languages": {"$in": tourist.get("languages", [])}
    }).to_list(length=50)
    return matched