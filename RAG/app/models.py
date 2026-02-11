from pydantic import BaseModel, EmailStr
from typing import List, Optional

# ------------------ User Models ------------------

class VehicleInfo(BaseModel):
    vehicle_type: str
    license_plate: str
    city: str
    capacity: Optional[int]
    description: Optional[str]

class ShopInfo(BaseModel):
    name: str
    city: str
    address: Optional[str]
    phone: Optional[str]
    description: Optional[str]
    opening_hours: Optional[str]
    categories: List[str] = []

class LocalProfile(BaseModel):
    name: str
    age: Optional[int]
    city: str
    occupation: str  # driver | shopkeeper | neighborhood_tourguide
    bio: Optional[str]
    avatar_url: Optional[str]
    national_id: str
    phone: str
    spoken_languages: List[str] = []
    vehicle_info: Optional[VehicleInfo]
    shop_info: Optional[ShopInfo]
    has_seen_rules: Optional[bool] = False
    earnings: Optional[float] = 0.0
    insta_pay_details: Optional[str]

class UserProfile(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str
    age: Optional[int]
    country: Optional[str]
    languages: List[str] = []
    currency: Optional[str]
    app_language: Optional[str] = "English"
    travel_type: Optional[str] = "solo"  # solo | group | family
    activities: List[str] = []
    avatar_url: Optional[str]
    bio: Optional[str]
    wishlist: List[str] = []
    visited: List[str] = []
    favorites: List[str] = []
    posts: List[str] = []

class User(BaseModel):
    user_type: str  # tourist | local
    profile: UserProfile | LocalProfile
