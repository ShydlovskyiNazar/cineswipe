from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from . import models, auth
from .database import get_db, engine
from .tmdb import get_popular, search_movies, GENRE_MAP

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CineSwipe API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RegisterSchema(BaseModel):
    email: str
    username: str
    password: str

class RateSchema(BaseModel):
    movie_id: int
    movie_title: str
    movie_poster: Optional[str]
    movie_genres: Optional[str]
    movie_year: Optional[int]
    score: float

class WatchlistSchema(BaseModel):
    movie_id: int
    movie_title: str
    movie_poster: Optional[str]
    movie_genres: Optional[str]
    movie_year: Optional[int]

class UsernameSchema(BaseModel):
    username: str

@app.post("/auth/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(400, "Email вже зареєстрований")
    user = models.User(
        email=data.email,
        username=data.username,
        hashed_password=auth.hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = auth.create_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "username": user.username}

@app.post("/auth/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form.username).first()
    if not user or not auth.verify_password(form.password, user.hashed_password):
        raise HTTPException(401, "Невірний email або пароль")
    token = auth.create_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "username": user.username}

@app.get("/auth/me")
def me(current_user: models.User = Depends(auth.get_current_user)):
    return {"id": current_user.id, "email": current_user.email, "username": current_user.username}

@app.patch("/auth/username")
def update_username(data: UsernameSchema, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    current_user.username = data.username
    db.commit()
    return {"ok": True, "username": data.username}

@app.get("/movies/swipe")
async def swipe_movies(
    page: int = 1,
    genre: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    genre_id = None
    if genre and genre != "all":
        reverse_map = {v: k for k, v in GENRE_MAP.items()}
        genre_id = reverse_map.get(genre)
    movies = await get_popular(page=page, genre_id=genre_id)
    rated_ids = {r.movie_id for r in db.query(models.MovieRating).filter_by(user_id=current_user.id).all()}
    want_ids = {w.movie_id for w in db.query(models.Watchlist).filter_by(user_id=current_user.id).all()}
    return [m for m in movies if m["id"] not in rated_ids and m["id"] not in want_ids]

@app.get("/movies/search")
async def search(q: str = Query(..., min_length=1)):
    return await search_movies(q)

@app.post("/movies/rate")
def rate_movie(data: RateSchema, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    existing = db.query(models.MovieRating).filter_by(user_id=current_user.id, movie_id=data.movie_id).first()
    if existing:
        existing.score = data.score
    else:
        rating = models.MovieRating(user_id=current_user.id, **data.dict())
        db.add(rating)
    db.commit()
    db.query(models.Watchlist).filter_by(user_id=current_user.id, movie_id=data.movie_id).delete()
    db.commit()
    return {"ok": True}

@app.get("/movies/rated")
def get_rated(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.MovieRating).filter_by(user_id=current_user.id).order_by(models.MovieRating.created_at.desc()).all()

@app.post("/watchlist/add")
def add_watchlist(data: WatchlistSchema, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    existing = db.query(models.Watchlist).filter_by(user_id=current_user.id, movie_id=data.movie_id).first()
    if not existing:
        item = models.Watchlist(user_id=current_user.id, **data.dict())
        db.add(item)
        db.commit()
    return {"ok": True}

@app.delete("/watchlist/{movie_id}")
def remove_watchlist(movie_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db.query(models.Watchlist).filter_by(user_id=current_user.id, movie_id=movie_id).delete()
    db.commit()
    return {"ok": True}

@app.get("/watchlist")
def get_watchlist(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Watchlist).filter_by(user_id=current_user.id).order_by(models.Watchlist.created_at.desc()).all()

@app.delete("/user/reset")
def reset_progress(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    db.query(models.MovieRating).filter_by(user_id=current_user.id).delete()
    db.query(models.Watchlist).filter_by(user_id=current_user.id).delete()
    db.commit()
    return {"ok": True}

@app.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    ratings = db.query(models.MovieRating).filter_by(user_id=current_user.id).all()
    watchlist = db.query(models.Watchlist).filter_by(user_id=current_user.id).all()
    avg = sum(r.score for r in ratings) / len(ratings) if ratings else 0
    genre_counts = {}
    for r in ratings:
        for g in (r.movie_genres or "").split(", "):
            if g:
                genre_counts[g] = genre_counts.get(g, 0) + 1
    return {
        "watched_count": len(ratings),
        "want_count": len(watchlist),
        "average_score": round(avg, 1),
        "genre_counts": genre_counts,
    }