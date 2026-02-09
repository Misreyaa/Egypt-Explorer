from fastapi import APIRouter, HTTPException, Depends
from ..models import Local
from ..db import locals_collection
from ..auth import create_access_token, get_current_user
from ..auth_models import LocalSignupRequest, LoginRequest
from ..utils import hash_password, verify_password

router = APIRouter()

# ----------------- Signup -----------------
@router.post("/signup")
async def signup(local: LocalSignupRequest):
    existing = await locals_collection.find_one({"email": local.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    local_dict = local.dict()
    local_dict["password"] = hash_password(local_dict["password"])
    result = await locals_collection.insert_one(local_dict)
    return {"id": str(result.inserted_id)}

# ----------------- Login -----------------
@router.post("/login")
async def login(data: LoginRequest):
    user = await locals_collection.find_one({"email": data.username})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

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
