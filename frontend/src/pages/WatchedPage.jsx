import React, { useState, useEffect } from 'react'
import API from '../api'

const FOLDER_META = {
  action: { name: { uk: 'Бойовик', en: 'Action' }, emoji: '💥' },
  drama: { name: { uk: 'Драма', en: 'Drama' }, emoji: '🎭' },
  comedy: { name: { uk: 'Комедія', en: 'Comedy' }, emoji: '😂' },
  thriller: { name: { uk: 'Трилер', en: 'Thriller' }, emoji: '😱' },
  'sci-fi': { name: { uk: 'Фантастика', en: 'Sci-Fi' }, emoji: '🚀' },
  romance: { name: { uk: 'Романтика', en: 'Romance' }, emoji: '❤️' },
  adventure: { name: { uk: 'Пригоди', en: 'Adventure' }, emoji: '🗺️' },
  animation: { name: { uk: 'Анімація', en: 'Animation' }, emoji: '🎨' },
  other: { name: { uk: 'Інше', en: 'Other' }, emoji: '🎬' },
}

export function WatchedPage({ lang = 'uk' }) {
  const [movies, setMovies] = useState([])
  const [openFolder, setOpenFolder] = useState(null)
  const [loading, setLoading] = useState(true)

  const T = {
    uk: { title: 'Переглянуто', empty: 'Ще немає переглянутих фільмів\nСвайпни вправо щоб додати', back: '← Назад', films: 'фільмів', film: 'фільм' },
    en: { title: 'Watched', empty: 'No watched films yet\nSwipe right to add', back: '← Back', films: 'films', film: 'film' },
  }[lang] || {}

  useEffect(() => {
    API.get('/movies/rated').then(r => setMovies(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 14 }}>...</div>

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
      <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: 'var(--bg)' }}>
        <div onClick={() => setOpenFolder(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e8335a', fontSize: 13, cursor: 'pointer', marginBottom: 12, fontWeight: 500 }}>
          {T.back}
        </div>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: 'var(--text)', marginBottom: 12 }}>
          {meta.emoji} {meta.name[lang] || meta.name.uk}
        </div>
        {items.map(m => (
          <div key={m.id} style={{ background: 'var(--card)', borderRadius: 12, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, border: '.5px solid var(--border)' }}>
            {m.movie_poster && <img src={m.movie_poster} alt={m.movie_title} style={{ width: 48, height: 68, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{m.movie_title}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{m.movie_year} · {m.movie_genres}</div>
            </div>
            <div style={{ background: '#e8335a', color: '#fff', padding: '3px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>★ {m.score}</div>
          </div>
        ))}
      </div>
    )
  }

  if (!Object.keys(groups).length) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: 20, background: 'var(--bg)' }}>
        {T.empty}
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: 'var(--bg)' }}>
      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: 'var(--text)', marginBottom: 12 }}>{T.title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {Object.entries(groups).map(([tag, items]) => {
          const meta = FOLDER_META[tag] || FOLDER_META.other
          return (
            <div key={tag} onClick={() => setOpenFolder(tag)}
              style={{ background: 'var(--card)', borderRadius: 14, padding: '14px 12px', cursor: 'pointer', border: '.5px solid var(--border)', transition: 'transform .15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>{meta.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{meta.name[lang] || meta.name.uk}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{items.length} {items.length === 1 ? T.film : T.films}</div>
              <div style={{ display: 'flex', gap: 3, marginTop: 8 }}>
                {items.slice(0, 3).map(m => (
                  m.movie_poster
                    ? <img key={m.id} src={m.movie_poster} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
                    : <div key={m.id} style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎬</div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}