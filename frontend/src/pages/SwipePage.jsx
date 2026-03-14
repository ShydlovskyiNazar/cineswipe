import React, { useState, useEffect, useRef } from 'react'
import API from '../api'

const GENRES = [
  { id: 'all', label: 'Всі' },
  { id: 'action', label: 'Бойовик' },
  { id: 'drama', label: 'Драма' },
  { id: 'comedy', label: 'Комедія' },
  { id: 'thriller', label: 'Трилер' },
  { id: 'sci-fi', label: 'Фантастика' },
]

const SWIPE_MAX = 150

export function SwipePage() {
  const [movies, setMovies] = useState([])
  const [genre, setGenre] = useState('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [liveScore, setLiveScore] = useState(null)
  const drag = useRef({ active: false, startX: 0, dx: 0 })
  const cardRef = useRef(null)

  const fetchMovies = async (g = genre, p = 1) => {
    setLoading(true)
    try {
      const r = await API.get('/movies/swipe', { params: { genre: g, page: p } })
      setMovies(r.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMovies(genre, 1) }, [genre])

  const current = movies[0]

  const applyDrag = (dx) => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = `translateX(${dx}px) rotate(${dx * 0.07}deg)`
    if (dx > 0) {
      setLiveScore(Math.min(10, Math.max(1, Math.round((dx / SWIPE_MAX) * 9) + 1)))
    } else {
      setLiveScore(null)
    }
  }

  const onStart = (x) => { drag.current = { active: true, startX: x, dx: 0 } }
  const onMove = (x) => {
    if (!drag.current.active) return
    drag.current.dx = x - drag.current.startX
    applyDrag(drag.current.dx)
  }
  const onEnd = async () => {
    if (!drag.current.active) return
    drag.current.active = false
    const dx = drag.current.dx
    const card = cardRef.current
    setLiveScore(null)

    if (dx > 40 && current) {
      const score = Math.min(10, Math.max(1, Math.round((dx / SWIPE_MAX) * 9) + 1))
      if (card) { card.style.transition = 'transform .3s'; card.style.transform = 'translateX(700px) rotate(35deg)' }
      await API.post('/movies/rate', {
        movie_id: current.id, movie_title: current.title,
        movie_poster: current.poster, movie_genres: current.genres,
        movie_year: current.year, score
      }).catch(() => {})
      setTimeout(() => { setMovies(prev => prev.slice(1)); if (card) { card.style.transition = ''; card.style.transform = '' } }, 300)
    } else if (dx < -80 && current) {
      if (card) { card.style.transition = 'transform .3s'; card.style.transform = 'translateX(-700px) rotate(-35deg)' }
      setTimeout(() => { setMovies(prev => prev.slice(1)); if (card) { card.style.transition = ''; card.style.transform = '' } }, 300)
    } else if (dx < -20 && current) {
      if (card) { card.style.transition = 'transform .3s'; card.style.transform = 'translateX(-700px) rotate(-20deg)' }
      await API.post('/watchlist/add', {
        movie_id: current.id, movie_title: current.title,
        movie_poster: current.poster, movie_genres: current.genres, movie_year: current.year
      }).catch(() => {})
      setTimeout(() => { setMovies(prev => prev.slice(1)); if (card) { card.style.transition = ''; card.style.transform = '' } }, 300)
    } else {
      if (card) { card.style.transition = 'transform .3s'; card.style.transform = '' }
    }

    if (movies.length <= 2) { setPage(p => p + 1); fetchMovies(genre, page + 1) }
  }

  const btnAction = async (action) => {
    if (!current) return
    const card = cardRef.current
    if (action === 'skip') {
      if (card) { card.style.transition = 'transform .3s'; card.style.transform = 'translateX(-700px) rotate(-35deg)' }
      setTimeout(() => { setMovies(prev => prev.slice(1)) }, 300)
    } else if (action === 'want') {
      if (card) { card.style.transition = 'transform .3s'; card.style.transform = 'translateX(-700px) rotate(-20deg)' }
      await API.post('/watchlist/add', { movie_id: current.id, movie_title: current.title, movie_poster: current.poster, movie_genres: current.genres, movie_year: current.year }).catch(() => {})
      setTimeout(() => { setMovies(prev => prev.slice(1)) }, 300)
    } else {
      if (card) { card.style.transition = 'transform .3s'; card.style.transform = 'translateX(700px) rotate(35deg)' }
      await API.post('/movies/rate', { movie_id: current.id, movie_title: current.title, movie_poster: current.poster, movie_genres: current.genres, movie_year: current.year, score: 8 }).catch(() => {})
      setTimeout(() => { setMovies(prev => prev.slice(1)) }, 300)
    }
  }

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 14 }}>Завантаження фільмів...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Genre filters */}
      <div style={{ padding: '7px 10px', display: 'flex', gap: 6, overflowX: 'auto', background: '#fff', borderBottom: '1px solid #f0ebe4', scrollbarWidth: 'none' }}>
        {GENRES.map(g => (
          <button key={g.id} onClick={() => setGenre(g.id)} style={{ padding: '4px 12px', borderRadius: 20, border: '1.5px solid', borderColor: genre === g.id ? '#e8335a' : '#e0d8d0', background: genre === g.id ? '#e8335a' : 'transparent', color: genre === g.id ? '#fff' : '#666', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {g.label}
          </button>
        ))}
      </div>

      {/* Card stack */}
      <div style={{ flex: 1, position: 'relative', padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {movies.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#aaa', fontSize: 13 }}>Фільми закінчились 🎬<br/>Змініть жанр</div>
        ) : (
          <div style={{ position: 'relative', width: '100%', height: 320 }}>
            {movies.slice(1, 3).reverse().map((m, i) => (
              <div key={m.id} style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 28px rgba(0,0,0,.18)', transform: `translateX(${(i + 1) * 14}px) translateY(${(i + 1) * 8}px) rotate(${(i + 1) * 3}deg)`, zIndex: i }}>
                <img src={m.poster} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
            {current && (
              <div ref={cardRef} style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 28px rgba(0,0,0,.18)', zIndex: 10, cursor: 'grab', userSelect: 'none' }}
                onMouseDown={e => onStart(e.clientX)}
                onMouseMove={e => onMove(e.clientX)}
                onMouseUp={onEnd}
                onMouseLeave={onEnd}
                onTouchStart={e => onStart(e.touches[0].clientX)}
                onTouchMove={e => onMove(e.touches[0].clientX)}
                onTouchEnd={onEnd}
              >
                <img src={current.poster} alt={current.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.88) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,.55)', color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ color: '#e8335a' }}>★</span>{current.rating}
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14 }}>
                  <div className="playfair" style={{ fontSize: 20, color: '#fff', marginBottom: 2 }}>{current.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', marginBottom: 3 }}>{current.year}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>{current.genres}</div>
                </div>
                {/* Live rating overlay */}
                {liveScore && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', borderRadius: 20, overflow: 'hidden', pointerEvents: 'none' }}>
                    <div style={{ width: 46, background: 'rgba(255,255,255,.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px 0', gap: 1 }}>
                      {Array.from({ length: 10 }, (_, i) => (
                        <div key={i} style={{ fontSize: 15, color: '#e8335a', lineHeight: 1, opacity: 10 - i <= liveScore ? 1 : 0.15 }}>★</div>
                      ))}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '0 14px', background: 'rgba(0,0,0,.15)' }}>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', marginBottom: 2 }}>Ваша оцінка</div>
                      <div className="playfair" style={{ fontSize: 58, color: '#fff', lineHeight: 1 }}>{liveScore}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ padding: '0 12px 10px', display: 'flex', justifyContent: 'center', gap: 16, background: '#f0ece6' }}>
        {[
          { action: 'skip', icon: '✕', label: 'НЕ ДИВИВСЯ', color: '#e8335a', bg: '#fff' },
          { action: 'want', icon: '👁', label: 'ХОЧУ', color: '#fff', bg: '#3a7bd5' },
          { action: 'watched', icon: '✓', label: 'ДИВИВСЯ', color: '#333', bg: '#fff' },
        ].map(b => (
          <button key={b.action} onClick={() => btnAction(b.action)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: b.bg, border: `2px solid ${b.bg === '#fff' ? b.color : b.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: b.color }}>
              {b.icon}
            </div>
            <span style={{ fontSize: 9, color: '#999' }}>{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
