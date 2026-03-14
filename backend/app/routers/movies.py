from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
import httpx
from app.database import get_db
from app.models.models import User, Rating, SwipeAction
from app.auth import get_current_user
from app.config import settings

router = APIRouter()

TMDB_BASE = "https://api.themoviedb.org/3"
GENRE_MAP = {
    "28": "бойовик", "12": "пригоди", "16": "мультфільм", "35": "комедія",
    "80": "кримінал", "99": "документальний", "18": "драма", "10751": "сімейний",
    "14": "фентезі", "36": "історичний", "27": "жахи", "10402": "музика",
    "9648": "детектив", "10749": "романтика", "878": "фантастика",
    "10770": "телефільм", "53": "трилер", "10752": "воєнний", "37": "вестерн"
}

@router.get("/discover")
async def discover_movies(
    genre_id: str = Query(None),
    year: int = Query(None),
    page: int = Query(1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    already_seen = {r.movie_id for r in db.query(Rating).filter(Rating.user_id == current_user.id).all()}

    params = {
        "api_key": settings.TMDB_API_KEY,
        "language": "uk-UA",
        "sort_by": "popularity.desc",
        "include_adult": False,
        "page": page,
    }
    if genre_id:
        params["with_genres"] = genre_id
    if year:
        params["primary_release_year"] = year

    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{TMDB_BASE}/discover/movie", params=params)
        data = resp.json()

    results = [m for m in data.get("results", []) if m["id"] not in already_seen]
    return {"movies": results[:10], "total_pages": data.get("total_pages", 1)}

@router.get("/genres")
async def get_genres():
    return {"genres": [{"id": k, "name": v} for k, v in GENRE_MAP.items()]}

@router.get("/search")
async def search_movies(q: str, current_user: User = Depends(get_current_user)):
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{TMDB_BASE}/search/movie", params={
            "api_key": settings.TMDB_API_KEY,
            "query": q,
            "language": "uk-UA"
        })
    return resp.json()
