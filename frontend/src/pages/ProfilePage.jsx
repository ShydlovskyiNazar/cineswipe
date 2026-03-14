import React, { useState, useEffect } from 'react'
import API from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export function ProfilePage({ onLogout, username }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('stats')

  useEffect(() => {
    API.get('/stats').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 14 }}>Завантаження...</div>

  const genreData = stats ? Object.entries(stats.genre_counts || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value })) : []
  const maxGenre = genreData[0]?.value || 1

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 14, background: '#f0ece6' }}>
      {/* Profile head */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 62, height: 62, borderRadius: '50%', background: '#e8335a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎬</div>
        <div className="playfair" style={{ fontSize: 18, color: '#1a1a1a' }}>{username}</div>
        <div style={{ fontSize: 11, color: '#aaa' }}>{stats?.watched_count || 0} переглянутих · {stats?.want_count || 0} в списку</div>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { num: stats?.watched_count || 0, label: 'Переглянуто' },
          { num: stats?.want_count || 0, label: 'Хочу' },
          { num: stats?.average_score || '—', label: 'Сер. оцінка' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '11px 8px', textAlign: 'center' }}>
            <div className="playfair" style={{ fontSize: 22, color: '#e8335a' }}>{s.num}</div>
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Average score */}
      {stats?.average_score > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div className="playfair" style={{ fontSize: 38, color: '#e8335a', lineHeight: 1 }}>{stats.average_score}</div>
          <div>
            <div style={{ fontSize: 11, color: '#aaa', marginBottom: 5 }}>Середня оцінка</div>
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} style={{ fontSize: 14, color: i < Math.round(stats.average_score) ? '#e8335a' : '#e0e0e0' }}>★</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Genre chart */}
      {genreData.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#aaa', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.4px' }}>Топ жанри</div>
          {genreData.map(({ name, value }) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: '#555', width: 80, flexShrink: 0 }}>{name}</div>
              <div style={{ flex: 1, height: 6, background: '#f0ebe4', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#e8335a', borderRadius: 3, width: `${Math.round(value / maxGenre * 100)}%`, transition: 'width .5s' }} />
              </div>
              <div style={{ fontSize: 11, color: '#aaa', minWidth: 16, textAlign: 'right' }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Settings section */}
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}>
        {[
          { icon: '🌍', label: 'Мова фільмів', sub: 'Українська, Англійська' },
          { icon: '⭐', label: 'Мінімальний рейтинг', sub: '7.0 і вище' },
        ].map((row, i) => (
          <div key={i} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '.5px solid #f5f5f5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f0fff4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{row.icon}</div>
              <div>
                <div style={{ fontSize: 13, color: '#1a1a1a' }}>{row.label}</div>
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>{row.sub}</div>
              </div>
            </div>
            <span style={{ color: '#ccc', fontSize: 14 }}>›</span>
          </div>
        ))}
        <div onClick={onLogout} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🚪</div>
          <div style={{ fontSize: 13, color: '#e8335a' }}>Вийти</div>
        </div>
      </div>
    </div>
  )
}
