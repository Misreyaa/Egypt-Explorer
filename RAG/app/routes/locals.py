from fastapi import APIRouter, HTTPException, Depends
from ..models import Local
from ..db import locals_collection, tourists_collection
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


@router.get("/{email}/match_tourists")
async def match_tourists(
    email: str,
    current_user: str = Depends(get_current_user)
):
    if current_user != email:
        raise HTTPException(status_code=403, detail="Not allowed to view this user's matches")

    local = await locals_collection.find_one({"email": email})
    if not local:
        raise HTTPException(status_code=404, detail="Local not found")

    local_languages = local.get("spoken_languages", ["Arabic", "English"])
    local_city = local.get("city")
    local_occupation = local.get("occupation")

    # For locals, set interests based on occupation
    if local_occupation == 'neighborhood_tourguide':
        local_interests = ['History', 'Culture', 'Architecture']
    elif local_occupation == 'driver':
        local_interests = ['Adventure', 'Nature', 'Beach']
    else:
        local_interests = ['Shopping', 'Food', 'Culture']

    tourists_cursor = tourists_collection.find()
    tourists_list = await tourists_cursor.to_list(length=100)

    matched_tourists = []
    for tourist in tourists_list:
        match_score = 0
        match_reasons = []

        # Language match
        shared_languages = [lang for lang in local_languages if lang in tourist.get("languages", [])]
        if shared_languages:
            match_score += 40
            match_reasons.append(f"Speaks {', '.join(shared_languages)}")

        # City interest match
        if local_city in tourist.get("interestedCities", []):
            match_score += 30
            match_reasons.append(f"Visiting {local_city}")

        # Interest match
        matching_interests = [act for act in tourist.get("activities", []) if act in local_interests]
        if matching_interests:
            match_score += min(20, len(matching_interests) * 7)
            match_reasons.append(f"{len(matching_interests)} matching interest{'s' if len(matching_interests) > 1 else ''}")

        # Travel type bonus
        if local_occupation == 'driver' and tourist.get("travelType") != 'solo':
            match_score += 10
            match_reasons.append(f"{tourist.get('travelType')} travel")

        matched_tourists.append({
            "id": str(tourist.get("_id")),
            "name": tourist.get("name"),
            "age": str(tourist.get("age")),
            "country": tourist.get("country"),
            "languages": tourist.get("languages", []),
            "travelType": tourist.get("travelType"),
            "interestedCities": tourist.get("interestedCities", []),
            "activities": tourist.get("activities", []),
            "bio": tourist.get("bio"),
            "avatarUrl": tourist.get("avatarUrl"),
            "matchScore": match_score,
            "matchReasons": match_reasons,
            "matchingInterests": matching_interests
        })

    # Sort by matchScore descending
    matched_tourists.sort(key=lambda x: x['matchScore'], reverse=True)

    return matched_tourists


