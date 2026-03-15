import React, { useState, useEffect } from 'react'
import { AuthPage } from './pages/AuthPage'
import { SwipePage } from './pages/SwipePage'
import { WatchedPage } from './pages/WatchedPage'
import { WantPage } from './pages/WantPage'
import { ProfilePage } from './pages/ProfilePage'
import { AchievementsPage } from './pages/AchievementsPage'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [username, setUsername] = useState(localStorage.getItem('username') || '')
  const [tab, setTab] = useState('swipe')
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'uk')
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const login = (tok, uname) => {
    localStorage.setItem('token', tok)
    localStorage.setItem('username', uname)
    setToken(tok)
    setUsername(uname)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken(null)
    setUsername('')
  }

  const changeLang = (l) => {
    localStorage.setItem('lang', l)
    setLang(l)
  }

  const T = {
    uk: { pick: 'Підібрати', watched: 'Переглянуто', want: 'Хочу', achieve: 'Бейджі', profile: 'Профіль' },
    en: { pick: 'Discover', watched: 'Watched', want: 'Watchlist', achieve: 'Badges', profile: 'Profile' },
  }[lang] || {}

  if (!token) return <AuthPage onLogin={login} />

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--header)', padding: '12px 20px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 32 }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: 'var(--text)' }}>CineSwipe</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
            {lang === 'uk' ? 'Привіт' : 'Hello'}, {username}!
          </div>
        </div>
        <button onClick={() => setDark(d => !d)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border2)', background: 'var(--bg3)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {dark ? '☀️' : '🌙'}
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'swipe' && <SwipePage lang={lang} dark={dark} />}
        {tab === 'watched' && <WatchedPage lang={lang} dark={dark} />}
        {tab === 'want' && <WantPage lang={lang} dark={dark} />}
        {tab === 'achieve' && <AchievementsPage lang={lang} />}
        {tab === 'profile' && <ProfilePage onLogout={logout} username={username} lang={lang} setLang={changeLang} dark={dark} setDark={setDark} />}
      </div>

      <div style={{ background: 'var(--header)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-around', padding: '8px 0 6px', flexShrink: 0 }}>
        {[
          { id: 'swipe', icon: '🎬', label: T.pick },
          { id: 'watched', icon: '✓', label: T.watched },
          { id: 'want', icon: '👁', label: T.want },
          { id: 'achieve', icon: '🏆', label: T.achieve },
          { id: 'profile', icon: '👤', label: T.profile },
        ].map(n => (
          <div key={n.id} onClick={() => setTab(n.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', fontSize: 9, color: tab === n.id ? 'var(--accent)' : 'var(--text3)', padding: '0 4px' }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            <span>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}