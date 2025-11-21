from db.database import Base
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime, timezone
from sqlalchemy.orm import relationship

class NoteModel(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    content = Column(String, nullable=True)
    color = Column(String(20), nullable=False)
    status = Column(String(20), default="pending")

    posx = Column(Float, default=0)
    posy = Column(Float, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # foreign key para el usuario
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # relación inversa
    user = relationship("UserModel", back_populates="notes")
