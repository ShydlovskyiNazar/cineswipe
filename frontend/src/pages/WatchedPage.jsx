import React, { useState, useEffect } from 'react'
import API from '../api'

const FOLDER_META = {
  action: { name: 'Бойовик', emoji: '💥' },
  drama: { name: 'Драма', emoji: '🎭' },
  comedy: { name: 'Комедія', emoji: '😂' },
  thriller: { name: 'Трилер', emoji: '😱' },
  'sci-fi': { name: 'Фантастика', emoji: '🚀' },
  romance: { name: 'Романтика', emoji: '❤️' },
  adventure: { name: 'Пригоди', emoji: '🗺️' },
  animation: { name: 'Анімація', emoji: '🎨' },
  other: { name: 'Інше', emoji: '🎬' },
}

export function WatchedPage() {
  const [movies, setMovies] = useState([])
  const [openFolder, setOpenFolder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/movies/rated').then(r => setMovies(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 14 }}>Завантаження...</div>

  // group by primary genre tag
  const groups = {}
  movies.forEach(m => {
    const tags = (m.movie_genres || '').split(', ').map(g => g.toLowerCase().trim())
    const key = tags[0] || 'other'
    if (!groups[key]) groups[key] = []
    groups[key].push(m)
  })

  if (openFolder) {
    const meta = FOLDER_META[openFolder] || FOLDER_META.other
    const items = groups[openFolder] || []
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: '#f0ece6' }}>
        <div onClick={() => setOpenFolder(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e8335a', fontSize: 13, cursor: 'pointer', marginBottom: 12, fontWeight: 500 }}>
          ← Назад
        </div>
        <div className="playfair" style={{ fontSize: 18, color: '#1a1a1a', marginBottom: 12 }}>{meta.emoji} {meta.name}</div>
        {items.map(m => (
          <div key={m.id} style={{ background: '#fff', borderRadius: 12, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, border: '.5px solid #f0ebe4' }}>
            {m.movie_poster && <img src={m.movie_poster} alt={m.movie_title} style={{ width: 48, height: 68, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{m.movie_title}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{m.movie_year} · {m.movie_genres}</div>
            </div>
            <div style={{ background: '#e8335a', color: '#fff', padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>★ {m.score}</div>
          </div>
        ))}
      </div>
    )
  }

  if (!Object.keys(groups).length) {
    return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 13, textAlign: 'center', padding: 20 }}>Ще немає переглянутих фільмів<br />Свайпни вправо щоб додати</div>
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: '#f0ece6' }}>
      <div className="playfair" style={{ fontSize: 18, color: '#1a1a1a', marginBottom: 12 }}>Переглянуто</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {Object.entries(groups).map(([tag, items]) => {
          const meta = FOLDER_META[tag] || FOLDER_META.other
          return (
            <div key={tag} onClick={() => setOpenFolder(tag)} style={{ background: '#fff', borderRadius: 14, padding: '14px 12px', cursor: 'pointer', border: '.5px solid #f0ebe4', transition: 'transform .15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{meta.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{meta.name}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{items.length} фільм{items.length === 1 ? '' : 'ів'}</div>
              <div style={{ display: 'flex', gap: 3, marginTop: 8 }}>
                {items.slice(0, 3).map(m => (
                  m.movie_poster
                    ? <img key={m.id} src={m.movie_poster} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
                    : <div key={m.id} style={{ width: 28, height: 28, borderRadius: 6, background: '#f5f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎬</div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
