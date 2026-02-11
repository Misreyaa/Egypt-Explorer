from pydantic import BaseModel, EmailStr
from typing import List, Optional

class TouristSignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: Optional[int] = None
    country: Optional[str] = None
    languages: List[str] = []
    currency: Optional[str] = None
    appLanguage: Optional[str] = "English"
    travelType: Optional[str] = "solo"
    activities: List[str] = []
    avatarUrl: Optional[str] = None
    bio: Optional[str] = None

class LocalSignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    languages: List[str] = []
    occupation: str
    phone: str
    city: str
    vehicle_info: Optional[dict] = None
    shop_info: Optional[dict] = None

class LoginRequest(BaseModel):
    username: str
    password: str
