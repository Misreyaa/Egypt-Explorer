from fastapi import APIRouter, HTTPException, Depends
from ..models import Local
from ..db import locals_collection
from ..auth import create_access_token, get_current_user
from ..auth_models import LocalSignupRequest, LoginRequest
from ..utils import hash_password, verify_password

router = APIRouter()


@router.put("/{email}")
async def update_local(
    email: str,
    update: Local,
    current_user: str = Depends(get_current_user)
):
    # Only allow the authenticated user to update their own account
    if current_user != email:
        raise HTTPException(status_code=403, detail="Not allowed to update this user")

    result = await locals_collection.update_one(
        {"email": email}, {"$set": update.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Local not found")
    return {"updated": result.modified_count}

# ----------------- Delete Local -----------------
@router.delete("/{email}")
async def delete_local(
    email: str,
    current_user: str = Depends(get_current_user)
):
    # Only allow the authenticated user to delete their own account
    if current_user != email:
        raise HTTPException(status_code=403, detail="Not allowed to delete this user")

    result = await locals_collection.delete_one({"email": email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Local not found")
    return {"deleted": result.deleted_count}
