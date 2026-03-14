import React, { useState } from 'react'
import API from '../api'

export function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      if (mode === 'register') {
        const r = await API.post('/auth/register', form)
        onLogin(r.data.access_token, r.data.username)
      } else {
        const params = new URLSearchParams()
        params.append('username', form.email)
        params.append('password', form.password)
        const r = await API.post('/auth/login', params)
        onLogin(r.data.access_token, r.data.username)
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка. Спробуй ще.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', minHeight: '100vh', background: '#f0ece6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="playfair" style={{ fontSize: 40, marginBottom: 8 }}>CineSwipe</div>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 32 }}>Твій особистий кінотеатр</div>
      <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', background: mode === m ? '#e8335a' : '#f5f0eb', color: mode === m ? '#fff' : '#888', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
              {m === 'login' ? 'Увійти' : 'Реєстрація'}
            </button>
          ))}
        </div>
        {mode === 'register' && (
          <input placeholder="Імʼя користувача" value={form.username} onChange={e => setForm({...form, username: e.target.value})}
            style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #e0d8d0', marginBottom: 10, fontSize: 14, outline: 'none' }} />
        )}
        <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
          style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #e0d8d0', marginBottom: 10, fontSize: 14, outline: 'none' }} />
        <input placeholder="Пароль" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid #e0d8d0', marginBottom: 16, fontSize: 14, outline: 'none' }} />
        {error && <div style={{ color: '#e8335a', fontSize: 12, marginBottom: 10 }}>{error}</div>}
        <button onClick={submit} disabled={loading} style={{ width: '100%', padding: '13px 0', borderRadius: 14, background: '#e8335a', color: '#fff', border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
          {loading ? 'Завантаження...' : mode === 'login' ? 'Увійти' : 'Зареєструватись'}
        </button>
      </div>
    </div>
  )
}
