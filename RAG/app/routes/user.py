from fastapi import APIRouter, HTTPException, Depends
from ..models import User, UserProfile, LocalProfile
from ..auth import create_access_token, get_current_user
from ..auth_models import TouristSignupRequest, LocalSignupRequest, LoginRequest
from ..db import tourists_collection, locals_collection, destinations_collection
from ..utils import hash_password, verify_password

router = APIRouter()

# ----------------- Tourist Signup -----------------
@router.post("/tourist/signup")
async def tourist_signup(request: TouristSignupRequest):
    existing = await tourists_collection.find_one({"email": request.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    user_dict = request.dict()
    print(user_dict["password"])
    # user_dict["password"] = hash_password(user_dict["password"])
    result = await tourists_collection.insert_one(user_dict)
    return {"id": str(result.inserted_id)}

# ----------------- Local Signup -----------------
@router.post("/local/signup")
async def local_signup(request: LocalSignupRequest):
    existing = await locals_collection.find_one({"email": request.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    user_dict = request.dict()
    user_dict["password"] = hash_password(user_dict["password"])
    result = await locals_collection.insert_one(user_dict)
    return {"id": str(result.inserted_id)}

# ----------------- Login (tourist or local) -----------------
@router.post("/login")
async def login(data: LoginRequest):
    user = await tourists_collection.find_one({"email": data.email})
    collection = "tourist"
    if not user:
        user = await locals_collection.find_one({"email": data.email})
        collection = "local"
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": data.username})
    return {"access_token": token, "token_type": "bearer", "user_type": collection}

# ----------------- Update User -----------------
@router.put("/{username}")
async def update_user(username: str, update: UserProfile | LocalProfile, current_user: str = Depends(get_current_user)):
    if current_user != username:
        raise HTTPException(status_code=403, detail="Not allowed")
    collection = tourists_collection if hasattr(update, "username") else locals_collection
    result = await collection.update_one({"username": username}, {"$set": update.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"updated": result.modified_count}

# ----------------- Delete User -----------------
@router.delete("/{username}")
async def delete_user(username: str, current_user: str = Depends(get_current_user)):
    if current_user != username:
        raise HTTPException(status_code=403, detail="Not allowed")
    result = await tourists_collection.delete_one({"username": username})
    if result.deleted_count == 0:
        result = await locals_collection.delete_one({"email": username})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"deleted": result.deleted_count}

# ----------------- Match Destinations -----------------
@router.get("/{username}/match_destinations")
async def match_destinations(username: str, current_user: str = Depends(get_current_user)):
    if current_user != username:
        raise HTTPException(status_code=403, detail="Not allowed")
    tourist = await tourists_collection.find_one({"username": username})
    if not tourist:
        raise HTTPException(status_code=404, detail="Tourist not found")
    matched = await destinations_collection.find({"tags": {"$in": tourist.get("activities", [])}}).to_list(length=50)
    return matched

# ----------------- Match Locals -----------------
@router.get("/{username}/match_locals")
async def match_locals(username: str, current_user: str = Depends(get_current_user)):
    if current_user != username:
        raise HTTPException(status_code=403, detail="Not allowed")
    tourist = await tourists_collection.find_one({"username": username})
    if not tourist:
        raise HTTPException(status_code=404, detail="Tourist not found")
    matched = await locals_collection.find({"languages": {"$in": tourist.get("languages", [])}}).to_list(length=50)
    return matched
