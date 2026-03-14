from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import anthropic
from app.database import get_db
from app.models.models import User, Rating, SwipeAction
from app.auth import get_current_user
from app.config import settings

router = APIRouter()

@router.get("/recommendations")
def get_recommendations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    watched = db.query(Rating).filter(
        Rating.user_id == current_user.id,
        Rating.action == SwipeAction.watched
    ).order_by(Rating.score.desc()).limit(10).all()

    if not watched:
        return {"recommendations": "Подивись хоча б кілька фільмів, щоб отримати рекомендації!", "movies": []}

    watched_summary = "\n".join([
        f"- {r.movie_title} (оцінка: {r.score}/10, жанри: {r.movie_genres})"
        for r in watched
    ])

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": f"""Ти — кінокритик та персональний рекомендаційний асистент.
Користувач переглянув такі фільми:
{watched_summary}

На основі цих вподобань:
1. Проаналізуй смаки користувача (2-3 речення)
2. Порекомендуй 5 конкретних фільмів з поясненням чому саме вони підійдуть
3. Відповідай українською мовою

Формат відповіді:
**Аналіз ваших вподобань:**
[аналіз]

**Рекомендації для вас:**
1. **Назва фільму** (рік) — [пояснення чому підійде]
2. ...
"""
        }]
    )

    return {
        "recommendations": message.content[0].text,
        "based_on": len(watched)
    }
