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
    user_dict["password"] = hash_password(user_dict["password"])
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
async def login_user(req: LoginRequest):
    # Try tourists first
    user = await tourists_collection.find_one({"email": req.email})
    user_type = "tourist"

    # If not found, try locals
    if not user:
        user = await locals_collection.find_one({"email": req.email})
        user_type = "local"

    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")

    token = create_access_token({"sub": user["email"]})

    # Build profile based on type
    if user_type == "tourist":
        profile = {
            "name": user.get("name"),
            "age": user.get("age"),
            "country": user.get("country"),
            "languages": user.get("languages", []),
            "currency": user.get("currency"),
            "appLanguage": user.get("app_language"),
            "travelType": user.get("travel_type"),
            "activities": user.get("activities", []),
            "avatarUrl": user.get("avatar_url"),
            "wishlist": user.get("wishlist", [])
        }
    else:  # local
        profile = {
            "name": user.get("name"),
            "age": user.get("age"),
            "city": user.get("city"),
            "occupation": user.get("occupation"),
            "bio": user.get("bio"),
            "avatarUrl": user.get("avatar_url"),
            "national_id": user.get("national_id"),
            "phone": user.get("phone"),
            "spoken_languages": user.get("spoken_languages", []),
            "vehicle_info": user.get("vehicle_info"),
            "shop_info": user.get("shop_info"),
            "hasSeenRules": user.get("hasSeenRules"),
            "earnings": user.get("earnings"),
            "instaPayDetails": user.get("instaPayDetails")
        }

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "userType": user_type,
            "profile": profile
        }
    }


# ----------------- Update User -----------------
@router.put("/{email}")
async def update_user(email: str, update: UserProfile | LocalProfile, current_user: str = Depends(get_current_user)):
    if current_user != email:
        raise HTTPException(status_code=403, detail="Not allowed")
    collection = tourists_collection if hasattr(update, "email") else locals_collection
    result = await collection.update_one({"email": email}, {"$set": update.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"updated": result.modified_count}

# ----------------- Delete User -----------------
@router.delete("/{email}")
async def delete_user(email: str, current_user: str = Depends(get_current_user)):
    if current_user != email:
        raise HTTPException(status_code=403, detail="Not allowed")
    result = await tourists_collection.delete_one({"email": email})
    if result.deleted_count == 0:
        result = await locals_collection.delete_one({"email": email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"deleted": result.deleted_count}

# ----------------- Match Destinations -----------------
@router.get("/{email}/match_destinations")
async def match_destinations(email: str, current_user: str = Depends(get_current_user)):
    if current_user != email:
        raise HTTPException(status_code=403, detail="Not allowed")
    tourist = await tourists_collection.find_one({"email": email})
    if not tourist:
        raise HTTPException(status_code=404, detail="Tourist not found")
    matched = await destinations_collection.find({"tags": {"$in": tourist.get("activities", [])}}).to_list(length=50)
    return matched

# ----------------- Match Locals -----------------
@router.get("/{email}/match_locals")
async def match_locals(email: str, current_user: str = Depends(get_current_user)):
    if current_user != email:
        raise HTTPException(status_code=403, detail="Not allowed")
    tourist = await tourists_collection.find_one({"email": email})
    if not tourist:
        raise HTTPException(status_code=404, detail="Tourist not found")
    matched = await locals_collection.find({"languages": {"$in": tourist.get("languages", [])}}).to_list(length=50)
    return matched
