from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NoteCreate(BaseModel):
    title: str
    content: str
    color: str
    status: str
    posx: float
    posy: float

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    color: Optional[str] = None
    status: Optional[str] = None
    posx: Optional[float] = None
    posy: Optional[float] = None

class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    color: str
    status: str
    posx: float
    posy: float
    user_id: int
    creation_date: datetime

    class Config:
        from_attributes = True
