import httpx
import os

TMDB_KEY = os.getenv("TMDB_API_KEY")
BASE = "https://api.themoviedb.org/3"
IMG_BASE = "https://image.tmdb.org/t/p/w500"

GENRE_MAP = {
    28: "action", 35: "comedy", 18: "drama",
    27: "horror", 878: "sci-fi", 53: "thriller",
    10749: "romance", 12: "adventure", 16: "animation"
}

async def get_popular(page: int = 1, genre_id: int = None):
    all_movies = []
    async with httpx.AsyncClient() as client:
        for p in range(page, page + 3):
            params = {
                "api_key": TMDB_KEY,
                "language": "uk-UA",
                "page": p,
                "vote_count.gte": 50,
                "sort_by": "popularity.desc"
            }
            if genre_id:
                params["with_genres"] = genre_id
            r = await client.get(f"{BASE}/discover/movie", params=params)
            data = r.json()
            all_movies.extend([format_movie(m) for m in data.get("results", []) if m.get("poster_path")])
    return all_movies

async def search_movies(query: str):
    params = {"api_key": TMDB_KEY, "language": "uk-UA", "query": query}
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{BASE}/search/movie", params=params)
        data = r.json()
    return [format_movie(m) for m in data.get("results", []) if m.get("poster_path")]

def format_movie(m):
    genre_ids = m.get("genre_ids", [])
    tags = list({GENRE_MAP[g] for g in genre_ids if g in GENRE_MAP})
    return {
        "id": m["id"],
        "title": m.get("title") or m.get("original_title", ""),
        "year": int(m.get("release_date", "0000")[:4]) if m.get("release_date") else 0,
        "rating": round(m.get("vote_average", 0), 1),
        "poster": IMG_BASE + m["poster_path"] if m.get("poster_path") else None,
        "overview": m.get("overview", ""),
        "tags": tags,
        "genres": ", ".join([g.capitalize() for g in tags]),
    }