import React, { useState, useEffect, useRef } from 'react'
import API from '../api'

const GENRE_FILTERS = [
  { id: 'all', label: 'Всі' },
  { id: 'action', label: 'Бойовик' },
  { id: 'drama', label: 'Драма' },
  { id: 'comedy', label: 'Комедія' },
  { id: 'thriller', label: 'Трилер' },
  { id: 'sci-fi', label: 'Фантастика' },
]

export function WantPage() {
  const [items, setItems] = useState([])
  const [genre, setGenre] = useState('all')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [showDd, setShowDd] = useState(false)
  const [modalMovie, setModalMovie] = useState(null)
  const [score, setScore] = useState(7)
  const [loading, setLoading] = useState(true)
  const searchRef = useRef(null)

  useEffect(() => {
    API.get('/watchlist').then(r => setItems(r.data)).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const t = setTimeout(async () => {
      if (search.trim().length < 2) { setResults([]); return }
      const r = await API.get('/movies/search', { params: { q: search } })
      const wIds = items.map(i => i.movie_id)
      setResults(r.data.filter(m => !wIds.includes(m.id)).slice(0, 6))
      setShowDd(true)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const addFromSearch = async (m) => {
    await API.post('/watchlist/add', { movie_id: m.id, movie_title: m.title, movie_poster: m.poster, movie_genres: m.genres, movie_year: m.year })
    const r = await API.get('/watchlist')
    setItems(r.data)
    setSearch(''); setShowDd(false); setResults([])
  }

  const remove = async (movieId) => {
    await API.delete(`/watchlist/${movieId}`)
    setItems(prev => prev.filter(i => i.movie_id !== movieId))
  }

  const openModal = (item) => { setModalMovie(item); setScore(7) }

  const confirmWatched = async () => {
    if (!modalMovie) return
    await API.post('/movies/rate', {
      movie_id: modalMovie.movie_id, movie_title: modalMovie.movie_title,
      movie_poster: modalMovie.movie_poster, movie_genres: modalMovie.movie_genres,
      movie_year: modalMovie.movie_year, score
    })
    await API.delete(`/watchlist/${modalMovie.movie_id}`)
    setItems(prev => prev.filter(i => i.movie_id !== modalMovie.movie_id))
    setModalMovie(null)
  }

  const filtered = genre === 'all' ? items : items.filter(i => (i.movie_genres || '').toLowerCase().includes(genre))

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 14 }}>Завантаження...</div>

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: '#f0ece6' }}>
      <div className="playfair" style={{ fontSize: 18, color: '#1a1a1a', marginBottom: 12 }}>Хочу подивитись</div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 10 }} ref={searchRef}>
        <input value={search} onChange={e => setSearch(e.target.value)} onFocus={() => results.length && setShowDd(true)}
          placeholder="🔍 Пошук фільму..."
          style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '.5px solid #e0d8d0', background: '#fff', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }} />
        {showDd && results.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderRadius: 12, border: '.5px solid #e0d8d0', boxShadow: '0 4px 20px rgba(0,0,0,.1)', zIndex: 100, overflow: 'hidden', marginTop: 4 }}>
            {results.map(m => (
              <div key={m.id} onClick={() => addFromSearch(m)}
                style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderBottom: '.5px solid #f5f5f5' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fdf0f3'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                {m.poster && <img src={m.poster} alt="" style={{ width: 32, height: 46, objectFit: 'cover', borderRadius: 6 }} />}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{m.year} · {m.genres}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Genre filters */}
      <div style={{ display: 'flex', gap: 5, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 12 }}>
        {GENRE_FILTERS.map(g => (
          <button key={g.id} onClick={() => setGenre(g.id)}
            style={{ padding: '4px 12px', borderRadius: 20, border: '1.5px solid', borderColor: genre === g.id ? '#3a7bd5' : '#e0d8d0', background: genre === g.id ? '#3a7bd5' : '#fff', color: genre === g.id ? '#fff' : '#666', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {g.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#aaa', fontSize: 12 }}>
          {items.length === 0 ? 'Ще нічого не додано\nСвайпни 👁 або знайди фільм' : 'Нічого не знайдено'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(item => (
            <div key={item.id} style={{ background: '#fff', borderRadius: 12, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 10, border: '.5px solid #f0ebe4' }}>
              {item.movie_poster && <img src={item.movie_poster} alt="" style={{ width: 40, height: 58, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.movie_title}</div>
                {item.movie_year && <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>{item.movie_year}</div>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
                  {(item.movie_genres || '').split(', ').filter(Boolean).map(g => (
                    <span key={g} style={{ background: '#f5f0eb', color: '#888', padding: '2px 7px', borderRadius: 8, fontSize: 10 }}>{g}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => openModal(item)} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: '#e8f5e9', color: '#27ae60', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</button>
                <button onClick={() => remove(item.movie_id)} style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: '#fdf0f3', color: '#e8335a', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating modal */}
      {modalMovie && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && setModalMovie(null)}>
          <div style={{ background: '#1a1a2e', borderRadius: '24px 24px 0 0', padding: '24px 24px 36px', width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              {modalMovie.movie_poster && <img src={modalMovie.movie_poster} alt="" style={{ width: 48, height: 68, objectFit: 'cover', borderRadius: 10 }} />}
              <div>
                <div className="playfair" style={{ fontSize: 18, color: '#fff' }}>{modalMovie.movie_title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>{modalMovie.movie_year}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginBottom: 8 }}>Ваша оцінка</div>
            <div className="playfair" style={{ fontSize: 56, color: '#fff', textAlign: 'center', lineHeight: 1, marginBottom: 12 }}>{score}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 16 }}>
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} onClick={() => setScore(i + 1)} style={{ fontSize: 22, cursor: 'pointer', color: i < score ? '#e8335a' : '#444' }}>★</span>
              ))}
            </div>
            <input type="range" min="1" max="10" step="1" value={score} onChange={e => setScore(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#e8335a', marginBottom: 20 }} />
            <button onClick={confirmWatched} style={{ width: '100%', padding: '14px 0', borderRadius: 16, background: '#e8335a', color: '#fff', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
              Підтвердити ✓
            </button>
            <button onClick={() => setModalMovie(null)} style={{ width: '100%', padding: '10px 0', background: 'transparent', color: 'rgba(255,255,255,.5)', border: 'none', fontSize: 13, cursor: 'pointer', marginTop: 6 }}>
              Скасувати
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
