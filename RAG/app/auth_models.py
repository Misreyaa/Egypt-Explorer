from pydantic import BaseModel, EmailStr

# Signup request for a Tourist
class TouristSignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    languages: list[str] = []
    preferences: list[str] = []

# Login request (shared for locals & tourists)
class LoginRequest(BaseModel):
    username: str
    password: str

# Signup request for a Local
class LocalSignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    languages: list[str] = []
