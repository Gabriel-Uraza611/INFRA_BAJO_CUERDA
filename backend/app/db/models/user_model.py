from db.database import Base
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime, timezone
from sqlalchemy.orm import relationship

class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String, nullable=False)
    creation_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(Boolean, default=True)

    # relación con notas
    notes = relationship("NoteModel", back_populates="user")
