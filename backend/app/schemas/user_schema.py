
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserRegister(BaseModel):
    """
    Schema for user registration input.
    NOTE: Passwords must be hashed before storing in the database.
    """
    name: str
    username: str
    email: EmailStr
    password: str  # Plain text password input; hash before storage.

class UserLogin(BaseModel):
    """
    Schema for user login input.
    NOTE: Passwords must be hashed and compared securely during authentication.
    """
    email: EmailStr
    password: str  # Plain text password input; never store as plain text.

class UserResponse(BaseModel):
    """
    Schema for user data returned in API responses.
    NOTE: Password is intentionally excluded for security reasons.
    """
    id: int
    name: str
    username: str
    email: EmailStr
    creation_date: datetime

    class Config:
        from_attributes = True  # Pydantic v2
