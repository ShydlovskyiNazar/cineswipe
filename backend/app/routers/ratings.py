from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import Counter
from app.database import get_db
from app.models.models import User, Rating, SwipeAction
from app.schemas.schemas import RatingCreate, RatingOut, StatsOut
from app.auth import get_current_user

router = APIRouter()

@router.post("/swipe", response_model=RatingOut)
def swipe(data: RatingCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Rating).filter(
        Rating.user_id == current_user.id,
        Rating.movie_id == data.movie_id
    ).first()
    if existing:
        existing.action = data.action
        existing.score = data.score
        db.commit()
        db.refresh(existing)
        return existing

    rating = Rating(
        user_id=current_user.id,
        movie_id=data.movie_id,
        movie_title=data.movie_title,
        movie_poster=data.movie_poster,
        movie_genres=data.movie_genres,
        action=data.action,
        score=data.score
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)
    return rating

@router.get("/watched", response_model=list[RatingOut])
def get_watched(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Rating).filter(
        Rating.user_id == current_user.id,
        Rating.action == SwipeAction.watched
    ).order_by(Rating.created_at.desc()).all()

@router.get("/stats", response_model=StatsOut)
def get_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    all_ratings = db.query(Rating).filter(Rating.user_id == current_user.id).all()
    watched = [r for r in all_ratings if r.action == SwipeAction.watched]
    skipped = [r for r in all_ratings if r.action == SwipeAction.skip]
    want = [r for r in all_ratings if r.action == SwipeAction.want]

    scores = [r.score for r in watched if r.score]
    avg_score = round(sum(scores) / len(scores), 1) if scores else None

    genre_counter = Counter()
    for r in watched:
        if r.movie_genres:
            for g in r.movie_genres.split(","):
                genre_counter[g.strip()] += 1

    score_dist = {}
    for s in scores:
        key = str(int(s))
        score_dist[key] = score_dist.get(key, 0) + 1

    return StatsOut(
        total_watched=len(watched),
        total_skipped=len(skipped),
        total_want=len(want),
        average_score=avg_score,
        top_genres=[{"genre": k, "count": v} for k, v in genre_counter.most_common(5)],
        score_distribution=[{"score": k, "count": v} for k, v in sorted(score_dist.items())]
    )

@router.delete("/{movie_id}")
def delete_rating(movie_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rating = db.query(Rating).filter(Rating.user_id == current_user.id, Rating.movie_id == movie_id).first()
    if not rating:
        raise HTTPException(status_code=404, detail="Оцінку не знайдено")
    db.delete(rating)
    db.commit()
    return {"ok": True}
