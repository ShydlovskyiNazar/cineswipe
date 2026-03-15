import React, { useState, useEffect } from 'react'
import API from '../api'

const LANGUAGES = [
  { id: 'uk', label: '🇺🇦 Українська' },
  { id: 'en', label: '🇬🇧 English' },
]

export function ProfilePage({ onLogout, username, lang, setLang }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editName, setEditName] = useState(false)
  const [newName, setNewName] = useState(username)
  const [saving, setSaving] = useState(false)
  const [showLangPicker, setShowLangPicker] = useState(false)

  const T = {
    uk: { profile: 'Мій профіль', watched: 'Переглянуто', want: 'Хочу', avg: 'Сер. оцінка', topGenres: 'Топ жанри', avgScore: 'Середня оцінка', lang: 'Мова', save: 'Зберегти', cancel: 'Скасувати', logout: 'Вийти', minRating: 'Мінімальний рейтинг', aiRecs: 'AI-рекомендації' },
    en: { profile: 'My Profile', watched: 'Watched', want: 'Watchlist', avg: 'Avg score', topGenres: 'Top genres', avgScore: 'Average score', lang: 'Language', save: 'Save', cancel: 'Cancel', logout: 'Log out', minRating: 'Minimum rating', aiRecs: 'AI recommendations' },
  }[lang] || {}

  useEffect(() => {
    API.get('/stats').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  const saveName = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      localStorage.setItem('username', newName.trim())
      setEditName(false)
      window.location.reload()
    } finally { setSaving(false) }
  }

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 14 }}>Завантаження...</div>

  const genreData = stats ? Object.entries(stats.genre_counts || {}).sort((a, b) => b[1] - a[1]).slice(0, 5) : []
  const maxGenre = genreData[0]?.[1] || 1

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: '#f0ece6' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 62, height: 62, borderRadius: '50%', background: '#e8335a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎬</div>
        {editName ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid #e8335a', fontSize: 14, outline: 'none', width: 160 }} autoFocus />
            <button onClick={saveName} disabled={saving} style={{ background: '#e8335a', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13 }}>{T.save}</button>
            <button onClick={() => setEditName(false)} style={{ background: '#f5f0eb', color: '#888', border: 'none', padding: '6px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13 }}>{T.cancel}</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#1a1a1a' }}>{username}</div>
            <button onClick={() => setEditName(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#aaa' }}>✏️</button>
          </div>
        )}
        <div style={{ fontSize: 11, color: '#aaa' }}>{stats?.watched_count || 0} {T.watched} · {stats?.want_count || 0} {T.want}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        {[{ num: stats?.watched_count || 0, label: T.watched }, { num: stats?.want_count || 0, label: T.want }, { num: stats?.average_score || '—', label: T.avg }].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '11px 8px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#e8335a' }}>{s.num}</div>
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {stats?.average_score > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 38, color: '#e8335a', lineHeight: 1 }}>{stats.average_score}</div>
          <div>
            <div style={{ fontSize: 11, color: '#aaa', marginBottom: 5 }}>{T.avgScore}</div>
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: 10 }, (_, i) => (<span key={i} style={{ fontSize: 14, color: i < Math.round(stats.average_score) ? '#e8335a' : '#e0e0e0' }}>★</span>))}
            </div>
          </div>
        </div>
      )}

      {genreData.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#aaa', marginBottom: 9, textTransform: 'uppercase', letterSpacing: '.4px' }}>{T.topGenres}</div>
          {genreData.map(([name, value]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: '#555', width: 80, flexShrink: 0 }}>{name}</div>
              <div style={{ flex: 1, height: 6, background: '#f0ebe4', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#e8335a', borderRadius: 3, width: `${Math.round(value / maxGenre * 100)}%` }} />
              </div>
              <div style={{ fontSize: 11, color: '#aaa', minWidth: 16, textAlign: 'right' }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}>
        <div onClick={() => setShowLangPicker(v => !v)} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '.5px solid #f5f5f5', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌍</div>
            <div>
              <div style={{ fontSize: 13, color: '#1a1a1a' }}>{T.lang}</div>
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>{LANGUAGES.find(l => l.id === lang)?.label}</div>
            </div>
          </div>
          <span style={{ color: '#ccc', fontSize: 14 }}>{showLangPicker ? '∨' : '›'}</span>
        </div>
        {showLangPicker && (
          <div style={{ borderBottom: '.5px solid #f5f5f5' }}>
            {LANGUAGES.map(l => (
              <div key={l.id} onClick={() => { setLang(l.id); setShowLangPicker(false) }} style={{ padding: '10px 14px 10px 54px', fontSize: 13, cursor: 'pointer', color: lang === l.id ? '#e8335a' : '#333', background: lang === l.id ? '#fff0f3' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {l.label}{lang === l.id && <span>✓</span>}
              </div>
            ))}
          </div>
        )}
        <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '.5px solid #f5f5f5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f0fff4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
            <div style={{ fontSize: 13, color: '#1a1a1a' }}>{T.aiRecs}</div>
          </div>
          <div style={{ width: 42, height: 23, background: '#e8335a', borderRadius: 12, position: 'relative', cursor: 'pointer' }}>
            <div style={{ width: 19, height: 19, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: 21, boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
          </div>
        </div>
        <div onClick={onLogout} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🚪</div>
          <div style={{ fontSize: 13, color: '#e8335a' }}>{T.logout}</div>
        </div>
      </div>
    </div>
  )
}