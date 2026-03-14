from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    ratings = relationship("MovieRating", back_populates="user")
    watchlist = relationship("Watchlist", back_populates="user")

class MovieRating(Base):
    __tablename__ = "movie_ratings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    movie_id = Column(Integer)
    movie_title = Column(String)
    movie_poster = Column(String)
    movie_genres = Column(String)
    movie_year = Column(Integer)
    score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="ratings")

class Watchlist(Base):
    __tablename__ = "watchlist"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    movie_id = Column(Integer)
    movie_title = Column(String)
    movie_poster = Column(String)
    movie_genres = Column(String)
    movie_year = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="watchlist")