from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.models import SwipeAction

# Auth
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Ratings
class RatingCreate(BaseModel):
    movie_id: int
    movie_title: str
    movie_poster: Optional[str] = None
    movie_genres: Optional[str] = None
    action: SwipeAction
    score: Optional[float] = None

class RatingOut(BaseModel):
    id: int
    movie_id: int
    movie_title: str
    movie_poster: Optional[str]
    movie_genres: Optional[str]
    action: SwipeAction
    score: Optional[float]
    created_at: datetime
    class Config:
        from_attributes = True

class StatsOut(BaseModel):
    total_watched: int
    total_skipped: int
    total_want: int
    average_score: Optional[float]
    top_genres: list[dict]
    score_distribution: list[dict]
