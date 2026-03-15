import React, { useState, useEffect, useRef } from 'react'
import API from '../api'

const SWIPE_MAX = 150
const CURRENT_YEAR = new Date().getFullYear()

const TUTORIAL_STEPS = [
  { emoji: '👉', title: 'Свайп вправо', desc: 'Тягни вправо — фільм переглянуто! Чим далі — тим вища оцінка', arrow: 'right' },
  { emoji: '👈', title: 'Свайп вліво', desc: 'Тягни вліво — не цікаво, пропустити', arrow: 'left' },
  { emoji: '👆', title: 'Свайп вгору', desc: 'Тягни вгору — додати до списку "Хочу подивитись"', arrow: 'up' },
  { emoji: '🎉', title: 'Готово!', desc: 'Тепер ти знаєш як користуватись CineSwipe. Насолоджуйся!', arrow: null },
]

const GENRES = {
  uk: [
    { id: 'all', label: 'Всі' },
    { id: 'action', label: 'Бойовик' },
    { id: 'drama', label: 'Драма' },
    { id: 'comedy', label: 'Комедія' },
    { id: 'thriller', label: 'Трилер' },
    { id: 'sci-fi', label: 'Фантастика' },
  ],
  en: [
    { id: 'all', label: 'All' },
    { id: 'action', label: 'Action' },
    { id: 'drama', label: 'Drama' },
    { id: 'comedy', label: 'Comedy' },
    { id: 'thriller', label: 'Thriller' },
    { id: 'sci-fi', label: 'Sci-Fi' },
  ],
}

function loadSeenIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem('seen_ids') || '[]'))
  } catch { return new Set() }
}

function saveSeenIds(set) {
  try {
    localStorage.setItem('seen_ids', JSON.stringify([...set]))
  } catch {}
}

export function SwipePage({ lang = 'uk' }) {
  const [movies, setMovies] = useState([])
  const [genre, setGenre] = useState('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [liveScore, setLiveScore] = useState(null)
  const [swipeDir, setSwipeDir] = useState(null)
  const [yearFrom, setYearFrom] = useState(1950)
  const [yearTo, setYearTo] = useState(CURRENT_YEAR)
  const [showYearFilter, setShowYearFilter] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(null)
  const drag = useRef({ active: false, startX: 0, startY: 0, dx: 0, dy: 0 })
  const cardRef = useRef(null)
  const seenIds = useRef(loadSeenIds())

  useEffect(() => {
    const seen = localStorage.getItem('cineswipe_tutorial_done')
    if (!seen) setTutorialStep(0)
  }, [])

  const fetchMovies = async (g = genre, p = 1) => {
    setLoading(true)
    try {
      const r = await API.get('/movies/swipe', { params: { genre: g, page: p } })
      const filtered = r.data.filter(m =>
        !seenIds.current.has(m.id) &&
        (!m.year || (m.year >= yearFrom && m.year <= yearTo))
      )
      setMovies(prev => p === 1 ? filtered : [...prev, ...filtered])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    setPage(1)
    fetchMovies(genre, 1)
  }, [genre, yearFrom, yearTo])

  const current = movies[0]
  const genres = GENRES[lang] || GENRES.uk

  const T = {
    uk: { from: 'від', to: 'до', loading: 'Завантаження...', empty: 'Фільми закінчились 🎬', refresh: 'Оновити', noWatched: 'Не дивився', want: 'Хочу', watched: 'Дивився', score: 'Ваша оцінка', swipeUp: 'ХОЧУ ДИВИТИСЬ', swipeLeft: 'НЕ ЦІКАВО' },
    en: { from: 'from', to: 'to', loading: 'Loading...', empty: 'No more films 🎬', refresh: 'Refresh', noWatched: 'Skip', want: 'Want', watched: 'Watched', score: 'Your rating', swipeUp: 'WANT TO WATCH', swipeLeft: 'NOT INTERESTED' },
  }[lang] || {}

  const markSeen = (id) => {
    seenIds.current.add(id)
    saveSeenIds(seenIds.current)
  }

  const applyDrag = (dx, dy) => {
    const card = cardRef.current
    if (!card) return
    if (Math.abs(dy) > Math.abs(dx) && dy < -30) {
      card.style.transform = `translateY(${dy}px) rotate(${dx * 0.03}deg)`
      setSwipeDir('up'); setLiveScore(null)
    } else if (dx > 0) {
      card.style.transform = `translateX(${dx}px) rotate(${dx * 0.07}deg)`
      setLiveScore(Math.min(10, Math.max(1, Math.round((dx / SWIPE_MAX) * 9) + 1)))
      setSwipeDir('right')
    } else if (dx < 0) {
      card.style.transform = `translateX(${dx}px) rotate(${dx * 0.07}deg)`
      setSwipeDir('left'); setLiveScore(null)
    } else {
      setSwipeDir(null); setLiveScore(null)
    }
  }

  const onStart = (x, y) => {
    drag.current = { active: true, startX: x, startY: y, dx: 0, dy: 0 }
    if (cardRef.current) cardRef.current.style.transition = 'none'
  }
  const onMove = (x, y) => {
    if (!drag.current.active) return
    drag.current.dx = x - drag.current.startX
    drag.current.dy = y - drag.current.startY
    applyDrag(drag.current.dx, drag.current.dy)
  }
  const onEnd = async () => {
    if (!drag.current.active) return
    drag.current.active = false
    const { dx, dy } = drag.current
    const card = cardRef.current
    setLiveScore(null); setSwipeDir(null)
    const isUp = Math.abs(dy) > Math.abs(dx) && dy < -80

    if (isUp && current) {
      if (card) { card.style.transition = 'transform .3s'; card.style.transform = 'translateY(-700px)' }
      await API.post('/watchlist/add', { movie_id: current.id, movie_title: current.title, movie_poster: current.poster, movie_genres: current.genres, movie_year: current.year }).catch(() => {})
      markSeen(current.id)
      setTimeout(() => { setMovies(prev => prev.slice(1)); if (card) { card.style.transition = ''; card.style.transform = '' } }, 300)
    } else if (dx > 40 && current) {
      const score = Math.min(10, Math.max(1, Math.round((dx / SWIPE_MAX) * 9) + 1))
      if (card) { card.style.transition = 'transform .3s'; card.style.transform = 'translateX(700px) rotate(35deg)' }
      await API.post('/movies/rate', { movie_id: current.id, movie_title: current.title, movie_poster: current.poster, movie_genres: current.genres, movie_year: current.year, score }).catch(() => {})
      markSeen(current.id)
      setTimeout(() => { setMovies(prev => prev.slice(1)); if (card) { card.style.transition = ''; card.style.transform = '' } }, 300)
    } else if (dx < -80 && current) {
      if (card) { card.style.transition = 'transform .3s'; card.style.transform = 'translateX(-700px) rotate(-35deg)' }
      markSeen(current.id)
      setTimeout(() => { setMovies(prev => prev.slice(1)); if (card) { card.style.transition = ''; card.style.transform = '' } }, 300)
    } else {
      if (card) { card.style.transition = 'transform .3s'; card.style.transform = '' }
    }
    if (movies.length <= 2) { const np = page + 1; setPage(np); fetchMovies(genre, np) }
  }

  const btnAction = async (action) => {
    if (!current) return
    const card = cardRef.current
    if (action === 'skip') {
      if (card) { card.style.transition = 'transform .3s'; card.style.transform = 'translateX(-700px) rotate(-35deg)' }
      markSeen(current.id)
      setTimeout(() => setMovies(prev => prev.slice(1)), 300)
    } else if (action === 'want') {
      if (card) { card.style.transition = 'transform .3s'; card.style.transform = 'translateY(-700px)' }
      await API.post('/watchlist/add', { movie_id: current.id, movie_title: current.title, movie_poster: current.poster, movie_genres: current.genres, movie_year: current.year }).catch(() => {})
      markSeen(current.id)
      setTimeout(() => setMovies(prev => prev.slice(1)), 300)
    } else {
      if (card) { card.style.transition = 'transform .3s'; card.style.transform = 'translateX(700px) rotate(35deg)' }
      await API.post('/movies/rate', { movie_id: current.id, movie_title: current.title, movie_poster: current.poster, movie_genres: current.genres, movie_year: current.year, score: 8 }).catch(() => {})
      markSeen(current.id)
      setTimeout(() => setMovies(prev => prev.slice(1)), 300)
    }
  }

  const finishTutorial = () => {
    localStorage.setItem('cineswipe_tutorial_done', '1')
    setTutorialStep(null)
  }

  const handleRefresh = () => {
    seenIds.current = new Set()
    saveSeenIds(seenIds.current)
    setPage(1)
    fetchMovies(genre, 1)
  }

  if (loading && movies.length === 0) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 14 }}>{T.loading}</div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', position: 'relative' }}>

      {tutorialStep !== null && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>{TUTORIAL_STEPS[tutorialStep].emoji}</div>
          {TUTORIAL_STEPS[tutorialStep].arrow === 'right' && <div style={{ fontSize: 40, color: '#27ae60', marginBottom: 8 }}>→</div>}
          {TUTORIAL_STEPS[tutorialStep].arrow === 'left' && <div style={{ fontSize: 40, color: '#e8335a', marginBottom: 8 }}>←</div>}
          {TUTORIAL_STEPS[tutorialStep].arrow === 'up' && <div style={{ fontSize: 40, color: '#3a7bd5', marginBottom: 8 }}>↑</div>}
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#fff', marginBottom: 10, textAlign: 'center' }}>{TUTORIAL_STEPS[tutorialStep].title}</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', textAlign: 'center', marginBottom: 28, lineHeight: 1.6 }}>{TUTORIAL_STEPS[tutorialStep].desc}</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {TUTORIAL_STEPS.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === tutorialStep ? '#e8335a' : 'rgba(255,255,255,.3)' }} />
            ))}
          </div>
          {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
            <button onClick={() => setTutorialStep(s => s + 1)} style={{ background: '#e8335a', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 24, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Далі →</button>
          ) : (
            <button onClick={finishTutorial} style={{ background: '#e8335a', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 24, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Почати! 🎬</button>
          )}
        </div>
      )}

      <div style={{ background: '#fff', borderBottom: '1px solid #f0ebe4', flexShrink: 0 }}>
        <div style={{ padding: '7px 10px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', alignItems: 'center' }}>
          {genres.map(g => (
            <button key={g.id} onClick={() => setGenre(g.id)} style={{ padding: '4px 12px', borderRadius: 20, border: '1.5px solid', borderColor: genre === g.id ? '#e8335a' : '#e0d8d0', background: genre === g.id ? '#e8335a' : 'transparent', color: genre === g.id ? '#fff' : '#666', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {g.label}
            </button>
          ))}
          <button onClick={() => setShowYearFilter(v => !v)} style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: 20, border: '1.5px solid', borderColor: showYearFilter ? '#e8335a' : '#e0d8d0', background: showYearFilter ? '#fff0f3' : 'transparent', color: showYearFilter ? '#e8335a' : '#666', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            📅 {yearFrom}–{yearTo}
          </button>
        </div>
        {showYearFilter && (
          <div style={{ padding: '10px 16px 14px', borderTop: '1px solid #f5f5f5' }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: '#aaa', marginBottom: 4 }}>{T.from}: {yearFrom}</div>
                <input type="range" min="1950" max={yearTo} value={yearFrom} onChange={e => setYearFrom(Number(e.target.value))} style={{ width: '100%', accentColor: '#e8335a' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: '#aaa', marginBottom: 4 }}>{T.to}: {yearTo}</div>
                <input type="range" min={yearFrom} max={CURRENT_YEAR} value={yearTo} onChange={e => setYearTo(Number(e.target.value))} style={{ width: '100%', accentColor: '#e8335a' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, position: 'relative', padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {movies.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#aaa', fontSize: 13 }}>
            {T.empty}<br/>
            <button onClick={handleRefresh} style={{ marginTop: 12, background: '#e8335a', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 20, cursor: 'pointer', fontSize: 12 }}>{T.refresh}</button>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', height: 320 }}>
            {movies.slice(1, 3).reverse().map((m, i) => (
              <div key={m.id} style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 28px rgba(0,0,0,.18)', transform: `translateX(${(i+1)*14}px) translateY(${(i+1)*8}px) rotate(${(i+1)*3}deg)`, zIndex: i }}>
                {m.poster && <img src={m.poster} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
            ))}
            {current && (
              <div ref={cardRef} style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 28px rgba(0,0,0,.18)', zIndex: 10, cursor: 'grab', userSelect: 'none' }}
                onMouseDown={e => onStart(e.clientX, e.clientY)}
                onMouseMove={e => { if(drag.current.active) onMove(e.clientX, e.clientY) }}
                onMouseUp={onEnd} onMouseLeave={onEnd}
                onTouchStart={e => onStart(e.touches[0].clientX, e.touches[0].clientY)}
                onTouchMove={e => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY) }}
                onTouchEnd={onEnd}
              >
                {current.poster && <img src={current.poster} alt={current.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.88) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,.55)', color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span style={{ color: '#e8335a' }}>★</span>{current.rating}
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14 }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#fff', marginBottom: 2 }}>{current.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', marginBottom: 3 }}>{current.year}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>{current.genres}</div>
                </div>
                {liveScore && swipeDir === 'right' && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', borderRadius: 20, overflow: 'hidden', pointerEvents: 'none' }}>
                    <div style={{ width: 46, background: 'rgba(255,255,255,.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px 0', gap: 1 }}>
                      {Array.from({ length: 10 }, (_, i) => (
                        <div key={i} style={{ fontSize: 15, color: '#e8335a', lineHeight: 1, opacity: 10 - i <= liveScore ? 1 : 0.15 }}>★</div>
                      ))}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '0 14px', background: 'rgba(0,0,0,.15)' }}>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', marginBottom: 2 }}>{T.score}</div>
                      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 58, color: '#fff', lineHeight: 1 }}>{liveScore}</div>
                    </div>
                  </div>
                )}
                {swipeDir === 'left' && (
                  <div style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: '#e8335a', border: '3px solid #e8335a', padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,.92)', pointerEvents: 'none' }}>{T.swipeLeft}</div>
                )}
                {swipeDir === 'up' && (
                  <div style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', color: '#3a7bd5', border: '3px solid #3a7bd5', padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,.92)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>{T.swipeUp}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: '0 12px 10px', display: 'flex', justifyContent: 'center', gap: 16, background: '#f0ece6' }}>
        {[
          { action: 'skip', icon: '✕', label: T.noWatched, color: '#e8335a', bg: '#fff' },
          { action: 'want', icon: '↑', label: T.want, color: '#fff', bg: '#3a7bd5' },
          { action: 'watched', icon: '✓', label: T.watched, color: '#333', bg: '#fff' },
        ].map(b => (
          <button key={b.action} onClick={() => btnAction(b.action)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: b.bg, border: `2px solid ${b.bg === '#fff' ? b.color : b.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: b.action === 'want' ? 20 : 17, color: b.color }}>
              {b.icon}
            </div>
            <span style={{ fontSize: 9, color: '#999' }}>{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}