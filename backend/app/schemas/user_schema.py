from pydantic import BaseModel
from datetime import datetime

class UserRegister(BaseModel):
    name: str
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    username: str
    email: str
    status: bool
    creation_date: datetime

    class Config:
        from_attributes = True