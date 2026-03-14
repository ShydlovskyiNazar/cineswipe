import React, { useState, useEffect } from 'react'
import { AuthPage } from './pages/AuthPage'
import { SwipePage } from './pages/SwipePage'
import { WatchedPage } from './pages/WatchedPage'
import { WantPage } from './pages/WantPage'
import { ProfilePage } from './pages/ProfilePage'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [username, setUsername] = useState(localStorage.getItem('username') || '')
  const [tab, setTab] = useState('swipe')

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

  if (!token) return <AuthPage onLogin={login} />

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', background: '#f0ece6', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '12px 20px 10px', borderBottom: '1px solid #f0ebe4', flexShrink: 0 }}>
        <div className="playfair" style={{ fontSize: 24, color: '#1a1a1a', textAlign: 'center' }}>CineSwipe</div>
        <div style={{ textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 2 }}>Привіт, {username}!</div>
      </div>

      {/* Pages */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'swipe' && <SwipePage />}
        {tab === 'watched' && <WatchedPage />}
        {tab === 'want' && <WantPage />}
        {tab === 'profile' && <ProfilePage onLogout={logout} username={username} />}
      </div>

      {/* Navbar */}
      <div style={{ background: '#fff', borderTop: '1px solid #f0ebe4', display: 'flex', justifyContent: 'space-around', padding: '8px 0 6px', flexShrink: 0 }}>
        {[
          { id: 'swipe', icon: '🎬', label: 'Підібрати' },
          { id: 'watched', icon: '✓', label: 'Переглянуто' },
          { id: 'want', icon: '👁', label: 'Хочу' },
          { id: 'profile', icon: '👤', label: 'Профіль' },
        ].map(n => (
          <div key={n.id} onClick={() => setTab(n.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', fontSize: 9, color: tab === n.id ? '#e8335a' : '#bbb', padding: '0 8px' }}>
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            <span>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
