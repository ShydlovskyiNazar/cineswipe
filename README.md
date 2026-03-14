# 🎬 CineSwipe

Веб-додаток для рекомендації фільмів у стилі Tinder.

## Стек
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Контейнери**: Docker Compose
- **API**: TMDB (фільми), JWT (авторизація)

## Запуск локально

### 1. Клонуй репозиторій
```bash
git clone https://github.com/твій_нікнейм/cineswipe
cd cineswipe
```

### 2. Створи .env файл
```bash
cp .env.example .env
```
Відкрий `.env` і встав свій TMDB ключ:
```
TMDB_API_KEY=твій_ключ_тут
```

### 3. Запусти через Docker
```bash
docker-compose up --build
```

### 4. Відкрий у браузері
- Фронтенд: http://localhost:5173
- Backend API: http://localhost:8000/docs

## Деплой

### Frontend → Vercel
1. Зайди на vercel.com
2. Import GitHub repo → вибери папку `frontend`
3. Додай змінну `VITE_API_URL=https://твій-backend.railway.app`

### Backend → Railway
1. Зайди на railway.app
2. New Project → Deploy from GitHub → вибери папку `backend`
3. Додай змінні: `TMDB_API_KEY`, `DATABASE_URL`, `JWT_SECRET`
4. Додай PostgreSQL сервіс в Railway

## Функціонал
- 🔐 Реєстрація та вхід (JWT)
- 🎬 Свайп фільмів з реальними постерами (TMDB API)
- ⭐ Оцінка 1-10 залежно від дальності свайпу
- 👁 Список "Хочу подивитись" з пошуком
- 📁 Переглянуті фільми у папках за жанрами
- 📊 Статистика та топ жанри
- 🐳 Docker Compose (3 контейнери)
- 🚀 CI/CD через GitHub Actions
