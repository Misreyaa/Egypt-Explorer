from typing import Optional, List

from pydantic import BaseModel


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
    category: Optional[str]
    sub_category: Optional[str]
    city: Optional[str]
    governorate: Optional[str]
    location: Optional[Location]
    short_description: Optional[str]
    historical_context: Optional[str]
    what_makes_it_special: Optional[str]
    visitor_experience: Optional[str]
    opening_hours: Optional[str]
    best_time_to_visit: Optional[str]
    dress_code: Optional[str]
    accessibility: Optional[str]
    traffic_and_access: Optional[str]
    average_visit_duration: Optional[str]
    entry_fee: Optional[str]
    safety_notes: Optional[str]
    local_tips: Optional[str]
    tags: List[str] = []
    sources: List[str] = []
    last_updated: Optional[str]
    image_path: Optional[str]



class Tourist(BaseModel):
    username: str
    email: str
    password_hash: str
    preferences: List[str] = []          # match with destinations' tags
    visited: List[str] = []              # place_ids
    favorites: List[str] = []            # place_ids
    languages: List[str] = []            # e.g., ["Arabic", "English"]
    bio: Optional[str] = None            # short introduction
    profile_picture: Optional[str] = None  # URL to profile picture
    posts: List[str] = []


class Comment(BaseModel):
    author_id: str             # tourist_id or local_id
    author_type: str           # "tourist" or "local"
    content: str
    timestamp: Optional[str] = None

class Post(BaseModel):
    post_id: str
    author_id: str             # local_id (who created the post)
    title: Optional[str] = None
    content: str
    tags: List[str] = []       # optional tags for filtering/searching
    timestamp: Optional[str] = None
    comments: List[Comment] = []  # comments on this post


class Local(BaseModel):
    name: str
    email: str
    phone: Optional[str]
    city: str
    languages: List[str] = []  # e.g., ["Arabic", "English"]
    occupation: str  # "shopkeeper", "driver", "volunteer guide"

    # Only for shopkeepers/drivers
    vehicle_or_shop_id: Optional[str] = None

    posts: List[str] = []  # IDs of posts in locals advice group
    rating: Optional[float] = None  # average rating
    reviews: List[str] = []  # tourist reviews
    bio: Optional[str] = None  # short bio / intro
    profile_picture: Optional[str] = None  # URL to profile picture

class Shop(BaseModel):
    shop_id: str
    owner_id: str            # local_id of the shopkeeper
    name: str
    city: str
    address: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    opening_hours: Optional[str] = None
    categories: Optional[list[str]] = []   # e.g., ["souvenir", "food"]
    rating: Optional[float] = None         # average rating from tourists

class Vehicle(BaseModel):
    vehicle_id: str
    owner_id: str            # local_id of the driver
    type: str                # e.g., "car", "van", "bus"
    license_plate: str
    city: str
    capacity: Optional[int] = None
    description: Optional[str] = None
    rating: Optional[float] = None        # average rating from tourists

