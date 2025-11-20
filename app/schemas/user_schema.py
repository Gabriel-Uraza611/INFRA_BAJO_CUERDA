from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserSchema(BaseModel):
    id: int
    username: str
    password: str
    email: str
    creation_date: datetime = datetime.now()