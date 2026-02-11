from typing import List, Optional

from pydantic import BaseModel, EmailStr


# ------------------ RAG & Domain Models ------------------


class QueryRequest(BaseModel):
    """Chatbot → backend request contract for RAG."""

    query: str
    wheelchair_only: bool = False
    # Optional structured filters; if provided we enforce them at retrieval time
    city: Optional[str] = None
    category: Optional[str] = None
    # Optional cap on number of hits / context size
    limit: int = 5


class PlaceSummary(BaseModel):
    place_id: str
    name: Optional[str] = None
    category: Optional[str] = None
    city: Optional[str] = None


class QueryResponse(BaseModel):
    """Backend → chatbot response contract for RAG."""

    response: str
    sources: list
    # Optional: how strong the best match was (0–1+ depending on Qdrant config)
    confidence: Optional[float] = None
    # Echo which filters were actually applied
    matched_filters: Optional[dict] = None
    # Optional: light-weight view of the places backing the answer
    places: Optional[List[PlaceSummary]] = None


class IngestionResponse(BaseModel):
    status: str
    documents_processed: int
    collection_name: str
    message: str


class Location(BaseModel):
    lat: float
    lng: float


class Destination(BaseModel):
    name: str
    place_id: str
    category: Optional[str] = None
    sub_category: Optional[str] = None
    city: Optional[str] = None
    governorate: Optional[str] = None
    location: Optional[Location] = None
    short_description: Optional[str] = None
    historical_context: Optional[str] = None
    what_makes_it_special: Optional[str] = None
    visitor_experience: Optional[str] = None
    opening_hours: Optional[str] = None
    best_time_to_visit: Optional[str] = None
    dress_code: Optional[str] = None
    accessibility: Optional[str] = None
    traffic_and_access: Optional[str] = None
    average_visit_duration: Optional[str] = None
    entry_fee: Optional[str] = None
    safety_notes: Optional[str] = None
    local_tips: Optional[str] = None
    tags: List[str] = []
    sources: List[str] = []
    last_updated: Optional[str] = None
    image_path: Optional[str] = None


class Tourist(BaseModel):
    name: str
    username: str
    email: str
    password_hash: str
    languages: List[str] = []  # frontend single language wrapped as list
    preferences: List[str] = []  # frontend activities
    visited: List[str] = []
    favorites: List[str] = []
    bio: Optional[str] = None
    profile_picture: Optional[str] = None  # avatarUrl from frontend
    posts: List[str] = []
    national_id: str
    verified: bool = False
    age: Optional[int] = None
    country: Optional[str] = None
    currency: Optional[str] = None
    app_language: Optional[str] = "English"
    travel_type: Optional[str] = "solo"  # "solo" | "group" | "family"


class Local(BaseModel):
    name: str
    email: str
    phone: Optional[str]
    city: str
    languages: List[str] = []
    occupation: str
    vehicle_or_shop_id: Optional[str] = None
    posts: List[str] = []
    rating: Optional[float] = None
    reviews: List[str] = []
    bio: Optional[str] = None
    profile_picture: Optional[str] = None


class Comment(BaseModel):
    author_id: str
    author_type: str  # "tourist" or "local"
    content: str
    timestamp: Optional[str] = None


class Post(BaseModel):
    post_id: str
    author_id: str
    title: Optional[str] = None
    content: str
    tags: List[str] = []
    timestamp: Optional[str] = None
    comments: List[Comment] = []


class Shop(BaseModel):
    shop_id: str
    owner_id: str
    name: str
    city: str
    address: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    opening_hours: Optional[str] = None
    categories: Optional[List[str]] = []
    rating: Optional[float] = None


class Vehicle(BaseModel):
    vehicle_id: str
    owner_id: str
    type: str
    license_plate: str
    city: str
    capacity: Optional[int] = None
    description: Optional[str] = None
    rating: Optional[float] = None


# ------------------ User Models (for new auth/profile flows) ------------------


class VehicleInfo(BaseModel):
    vehicle_type: str
    license_plate: str
    city: str
    capacity: Optional[int] = None
    description: Optional[str] = None


class ShopInfo(BaseModel):
    name: str
    city: str
    address: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    opening_hours: Optional[str] = None
    categories: List[str] = []


class LocalProfile(BaseModel):
    name: str
    age: Optional[int] = None
    city: str
    occupation: str  # driver | shopkeeper | neighborhood_tourguide
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    national_id: str
    phone: str
    spoken_languages: List[str] = []
    vehicle_info: Optional[VehicleInfo] = None
    shop_info: Optional[ShopInfo] = None
    has_seen_rules: Optional[bool] = False
    earnings: Optional[float] = 0.0
    insta_pay_details: Optional[str] = None


class UserProfile(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: Optional[int] = None
    country: Optional[str] = None
    languages: List[str] = []
    currency: Optional[str] = None
    appLanguage: Optional[str] = "English"
    travelType: Optional[str] = "solo"  # solo | group | family
    activities: List[str] = []
    avatarUrl: Optional[str] = None
    bio: Optional[str] = None
    wishlist: List[str] = []
    visited: List[str] = []
    favorites: List[str] = []
    posts: List[str] = []


class User(BaseModel):
    user_type: str  # tourist | local
    profile: UserProfile | LocalProfile
