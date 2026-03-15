import React, { useState, useEffect } from 'react'
import API from '../api'

const LANGUAGES = [
  { id: 'uk', label: '🇺🇦 Українська' },
  { id: 'en', label: '🇬🇧 English' },
]

const ACHIEVEMENTS = [
  { id: 'first', icon: '🎬', title: { uk: 'Перший фільм', en: 'First film' }, desc: { uk: 'Переглянув перший фільм', en: 'Watched your first film' }, check: s => s.watched >= 1 },
  { id: 'five', icon: '⭐', title: { uk: '5 фільмів', en: '5 films' }, desc: { uk: 'Переглянув 5 фільмів', en: 'Watched 5 films' }, check: s => s.watched >= 5 },
  { id: 'ten', icon: '🔥', title: { uk: '10 фільмів', en: '10 films' }, desc: { uk: 'Переглянув 10 фільмів', en: 'Watched 10 films' }, check: s => s.watched >= 10 },
  { id: 'twenty', icon: '💎', title: { uk: '20 фільмів', en: '20 films' }, desc: { uk: 'Переглянув 20 фільмів', en: 'Watched 20 films' }, check: s => s.watched >= 20 },
  { id: 'fifty', icon: '👑', title: { uk: '50 фільмів', en: '50 films' }, desc: { uk: 'Справжній кіноман!', en: 'True cinephile!' }, check: s => s.watched >= 50 },
  { id: 'hundred', icon: '🏆', title: { uk: '100 фільмів', en: '100 films' }, desc: { uk: 'Легенда кіно!', en: 'Cinema legend!' }, check: s => s.watched >= 100 },
  { id: 'critic', icon: '✍️', title: { uk: 'Критик', en: 'Critic' }, desc: { uk: 'Середня оцінка вище 8', en: 'Average rating above 8' }, check: s => s.avg >= 8 && s.watched >= 5 },
  { id: 'harsh', icon: '😤', title: { uk: 'Суворий', en: 'Harsh' }, desc: { uk: 'Середня оцінка нижче 5', en: 'Average rating below 5' }, check: s => s.avg < 5 && s.watched >= 5 },
  { id: 'wishlist', icon: '👁', title: { uk: 'Список бажань', en: 'Wishlist' }, desc: { uk: '10 фільмів у списку', en: '10 films in watchlist' }, check: s => s.want >= 10 },
  { id: 'action', icon: '💥', title: { uk: 'Бойовик-маніяк', en: 'Action maniac' }, desc: { uk: '10 бойовиків', en: '10 action films' }, check: s => (s.genres['Action'] || s.genres['action'] || 0) >= 10 },
  { id: 'drama', icon: '🎭', title: { uk: 'Драматург', en: 'Dramatist' }, desc: { uk: '10 драм', en: '10 dramas' }, check: s => (s.genres['Drama'] || s.genres['drama'] || 0) >= 10 },
  { id: 'scifi', icon: '🚀', title: { uk: 'Космонавт', en: 'Astronaut' }, desc: { uk: '10 фантастик', en: '10 sci-fi films' }, check: s => (s.genres['Sci-fi'] || s.genres['sci-fi'] || 0) >= 10 },
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
  const [showAchievements, setShowAchievements] = useState(false)

  const T = {
    uk: { watched: 'Переглянуто', want: 'Хочу', avg: 'Сер. оцінка', topGenres: 'Топ жанри', avgScore: 'Середня оцінка', lang: 'Мова', save: 'Зберегти', cancel: 'Скасувати', logout: 'Вийти', aiRecs: 'AI-рекомендації', reset: 'Скинути прогрес', resetConfirm: 'Ти впевнений? Всі оцінки та переглянуті фільми будуть видалені!', resetYes: 'Так, скинути', resetNo: 'Скасувати', resetDone: 'Прогрес скинуто!', darkTheme: 'Темна тема', lightTheme: 'Світла тема', achievements: 'Досягнення', unlocked: 'отримано', locked: 'Заблоковано' },
    en: { watched: 'Watched', want: 'Watchlist', avg: 'Avg score', topGenres: 'Top genres', avgScore: 'Average score', lang: 'Language', save: 'Save', cancel: 'Cancel', logout: 'Log out', aiRecs: 'AI recommendations', reset: 'Reset progress', resetConfirm: 'Are you sure? All ratings and watched films will be deleted!', resetYes: 'Yes, reset', resetNo: 'Cancel', resetDone: 'Progress reset!', darkTheme: 'Dark theme', lightTheme: 'Light theme', achievements: 'Achievements', unlocked: 'unlocked', locked: 'Locked' },
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
    localStorage.removeItem('achievements')
    setShowResetConfirm(false)
    setStats({ watched_count: 0, want_count: 0, average_score: 0, genre_counts: {} })
    alert(T.resetDone)
  }

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 14 }}>...</div>

  const genreData = stats ? Object.entries(stats.genre_counts || {}).sort((a, b) => b[1] - a[1]).slice(0, 5) : []
  const maxGenre = genreData[0]?.[1] || 1

  const achievStats = stats ? { watched: stats.watched_count, want: stats.want_count, avg: stats.average_score, genres: stats.genre_counts || {} } : { watched: 0, want: 0, avg: 0, genres: {} }
  const unlocked = ACHIEVEMENTS.filter(a => a.check(achievStats))
  const locked = ACHIEVEMENTS.filter(a => !a.check(achievStats))

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: 'var(--bg)' }}>

      {/* Reset confirm modal */}
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

      {/* Achievements modal */}
      {showAchievements && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && setShowAchievements(false)}>
          <div style={{ background: 'var(--card)', borderRadius: '24px 24px 0 0', padding: '24px 20px 36px', width: '100%', maxWidth: 420, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--text)' }}>{T.achievements}</div>
              <button onClick={() => setShowAchievements(false)} style={{ background: 'var(--bg3)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', color: 'var(--text2)', fontSize: 16 }}>✕</button>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
                <span>{unlocked.length}/{ACHIEVEMENTS.length} {T.unlocked}</span>
                <span>{Math.round(unlocked.length / ACHIEVEMENTS.length * 100)}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#e8335a', borderRadius: 3, width: `${unlocked.length / ACHIEVEMENTS.length * 100}%` }} />
              </div>
            </div>

            {/* Unlocked */}
            {unlocked.length > 0 && (
              <>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.4px' }}>✓ {T.unlocked}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
                  {unlocked.map(a => (
                    <div key={a.id} style={{ background: 'var(--bg)', borderRadius: 14, padding: 12, border: '1.5px solid #e8335a', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, right: 0, width: 32, height: 32, background: '#e8335a', borderRadius: '0 14px 0 32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '4px 6px' }}>
                        <span style={{ fontSize: 9, color: '#fff' }}>✓</span>
                      </div>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{a.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{a.title[lang]}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{a.desc[lang]}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Locked */}
            {locked.length > 0 && (
              <>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.4px' }}>🔒 {T.locked}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {locked.map(a => (
                    <div key={a.id} style={{ background: 'var(--bg)', borderRadius: 14, padding: 12, border: '1.5px solid var(--border)', opacity: 0.5 }}>
                      <div style={{ fontSize: 28, marginBottom: 6, filter: 'grayscale(1)' }}>{a.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{a.title[lang]}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>{a.desc[lang]}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Profile head */}
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

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        {[{ num: stats?.watched_count || 0, label: T.watched }, { num: stats?.want_count || 0, label: T.want }, { num: stats?.average_score || '—', label: T.avg }].map((s, i) => (
          <div key={i} style={{ background: 'var(--card)', borderRadius: 12, padding: '11px 8px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#e8335a' }}>{s.num}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Achievements preview */}
      <div onClick={() => setShowAchievements(true)} style={{ background: 'var(--card)', borderRadius: 14, padding: '14px 16px', marginBottom: 12, cursor: 'pointer', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>🏆 {T.achievements}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {unlocked.slice(0, 5).map(a => (
              <span key={a.id} style={{ fontSize: 20 }}>{a.icon}</span>
            ))}
            {unlocked.length === 0 && <span style={{ fontSize: 11, color: 'var(--text3)' }}>Ще немає досягнень</span>}
            {unlocked.length > 5 && <span style={{ fontSize: 11, color: 'var(--text3)', alignSelf: 'center' }}>+{unlocked.length - 5}</span>}
          </div>
          <div style={{ marginTop: 8, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', width: 120 }}>
            <div style={{ height: '100%', background: '#e8335a', borderRadius: 2, width: `${unlocked.length / ACHIEVEMENTS.length * 100}%` }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{unlocked.length}/{ACHIEVEMENTS.length} {T.unlocked}</div>
        </div>
        <span style={{ color: 'var(--text3)', fontSize: 18 }}>›</span>
      </div>

      {/* Avg score */}
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

      {/* Genre bars */}
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

      {/* Settings */}
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