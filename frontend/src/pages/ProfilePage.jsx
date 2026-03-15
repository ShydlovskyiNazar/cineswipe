import React, { useState, useEffect } from 'react'
import API from '../api'

const LANGUAGES = [
  { id: 'uk', label: '🇺🇦 Українська' },
  { id: 'en', label: '🇬🇧 English' },
]

export function ProfilePage({ onLogout, username, lang, setLang, dark, setDark }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editName, setEditName] = useState(false)
  const [newName, setNewName] = useState(username)
  const [saving, setSaving] = useState(false)
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(() => localStorage.getItem('ai_enabled') !== 'false')
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const T = {
    uk: { watched: 'Переглянуто', want: 'Хочу', avg: 'Сер. оцінка', topGenres: 'Топ жанри', avgScore: 'Середня оцінка', lang: 'Мова', save: 'Зберегти', cancel: 'Скасувати', logout: 'Вийти', aiRecs: 'AI-рекомендації', reset: 'Скинути прогрес', resetConfirm: 'Ти впевнений? Всі оцінки та переглянуті фільми будуть видалені!', resetYes: 'Так, скинути', resetNo: 'Скасувати', resetDone: 'Прогрес скинуто!', darkTheme: 'Темна тема', lightTheme: 'Світла тема' },
    en: { watched: 'Watched', want: 'Watchlist', avg: 'Avg score', topGenres: 'Top genres', avgScore: 'Average score', lang: 'Language', save: 'Save', cancel: 'Cancel', logout: 'Log out', aiRecs: 'AI recommendations', reset: 'Reset progress', resetConfirm: 'Are you sure? All ratings and watched films will be deleted!', resetYes: 'Yes, reset', resetNo: 'Cancel', resetDone: 'Progress reset!', darkTheme: 'Dark theme', lightTheme: 'Light theme' },
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

  const toggleAi = () => {
    const next = !aiEnabled
    setAiEnabled(next)
    localStorage.setItem('ai_enabled', String(next))
  }

  const resetProgress = async () => {
    try { await API.delete('/user/reset') } catch {}
    localStorage.removeItem('seen_ids')
    localStorage.removeItem('cineswipe_tutorial_done')
    setShowResetConfirm(false)
    setStats({ watched_count: 0, want_count: 0, average_score: 0, genre_counts: {} })
    alert(T.resetDone)
  }

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 14 }}>...</div>

  const genreData = stats ? Object.entries(stats.genre_counts || {}).sort((a, b) => b[1] - a[1]).slice(0, 5) : []
  const maxGenre = genreData[0]?.[1] || 1

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: 'var(--bg)' }}>

      {showResetConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 }}>
            <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 14, color: 'var(--text)', textAlign: 'center', marginBottom: 20, lineHeight: 1.6 }}>{T.resetConfirm}</div>
            <button onClick={resetProgress} style={{ width: '100%', padding: '12px 0', borderRadius: 14, background: '#e8335a', color: '#fff', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 8 }}>{T.resetYes}</button>
            <button onClick={() => setShowResetConfirm(false)} style={{ width: '100%', padding: '12px 0', borderRadius: 14, background: 'var(--bg3)', color: 'var(--text2)', border: 'none', fontSize: 14, cursor: 'pointer' }}>{T.resetNo}</button>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 62, height: 62, borderRadius: '50%', background: '#e8335a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎬</div>
        {editName ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid #e8335a', fontSize: 14, outline: 'none', width: 160, background: 'var(--bg)', color: 'var(--text)' }} autoFocus />
            <button onClick={saveName} disabled={saving} style={{ background: '#e8335a', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13 }}>{T.save}</button>
            <button onClick={() => setEditName(false)} style={{ background: 'var(--bg3)', color: 'var(--text2)', border: 'none', padding: '6px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13 }}>{T.cancel}</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: 'var(--text)' }}>{username}</div>
            <button onClick={() => setEditName(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text3)' }}>✏️</button>
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{stats?.watched_count || 0} {T.watched} · {stats?.want_count || 0} {T.want}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        {[{ num: stats?.watched_count || 0, label: T.watched }, { num: stats?.want_count || 0, label: T.want }, { num: stats?.average_score || '—', label: T.avg }].map((s, i) => (
          <div key={i} style={{ background: 'var(--card)', borderRadius: 12, padding: '11px 8px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#e8335a' }}>{s.num}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {stats?.average_score > 0 && (
        <div style={{ background: 'var(--card)', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 38, color: '#e8335a', lineHeight: 1 }}>{stats.average_score}</div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 5 }}>{T.avgScore}</div>
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: 10 }, (_, i) => (<span key={i} style={{ fontSize: 14, color: i < Math.round(stats.average_score) ? '#e8335a' : 'var(--border2)' }}>★</span>))}
            </div>
          </div>
        </div>
      )}

      {genreData.length > 0 && (
        <div style={{ background: 'var(--card)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 9, textTransform: 'uppercase', letterSpacing: '.4px' }}>{T.topGenres}</div>
          {genreData.map(([name, value]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text2)', width: 80, flexShrink: 0 }}>{name}</div>
              <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#e8335a', borderRadius: 3, width: `${Math.round(value / maxGenre * 100)}%` }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', minWidth: 16, textAlign: 'right' }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'var(--card)', borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}>

        <div onClick={() => setShowLangPicker(v => !v)} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '.5px solid var(--border)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌍</div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{T.lang}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{LANGUAGES.find(l => l.id === lang)?.label}</div>
            </div>
          </div>
          <span style={{ color: 'var(--text3)', fontSize: 14 }}>{showLangPicker ? '∨' : '›'}</span>
        </div>
        {showLangPicker && (
          <div style={{ borderBottom: '.5px solid var(--border)' }}>
            {LANGUAGES.map(l => (
              <div key={l.id} onClick={() => { setLang(l.id); setShowLangPicker(false) }} style={{ padding: '10px 14px 10px 54px', fontSize: 13, cursor: 'pointer', color: lang === l.id ? '#e8335a' : 'var(--text)', background: lang === l.id ? '#fff0f3' : 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {l.label}{lang === l.id && <span>✓</span>}
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '.5px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f0fff4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
            <div style={{ fontSize: 13, color: 'var(--text)' }}>{T.aiRecs}</div>
          </div>
          <div onClick={toggleAi} style={{ width: 42, height: 23, background: aiEnabled ? '#e8335a' : 'var(--border2)', borderRadius: 12, position: 'relative', cursor: 'pointer', transition: 'background .2s' }}>
            <div style={{ width: 19, height: 19, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: aiEnabled ? 21 : 2, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
          </div>
        </div>

        <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '.5px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{dark ? '☀️' : '🌙'}</div>
            <div style={{ fontSize: 13, color: 'var(--text)' }}>{dark ? T.lightTheme : T.darkTheme}</div>
          </div>
          <div onClick={() => setDark(d => !d)} style={{ width: 42, height: 23, background: dark ? '#e8335a' : 'var(--border2)', borderRadius: 12, position: 'relative', cursor: 'pointer', transition: 'background .2s' }}>
            <div style={{ width: 19, height: 19, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: dark ? 21 : 2, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
          </div>
        </div>

        <div onClick={() => setShowResetConfirm(true)} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderBottom: '.5px solid var(--border)' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#fff8e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔄</div>
          <div style={{ fontSize: 13, color: '#f39c12' }}>{T.reset}</div>
        </div>

        <div onClick={onLogout} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🚪</div>
          <div style={{ fontSize: 13, color: '#e8335a' }}>{T.logout}</div>
        </div>
      </div>
    </div>
  )
}