import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../api/axios'

const COLORS = ['#e8335a', '#ff6b8a', '#ff99b0', '#ffc0cc', '#ffd9e0']

export default function StatsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/ratings/stats')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Завантаження...</div>
  if (!stats) return null

  const noData = stats.total_watched === 0

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Переглянуто', value: stats.total_watched, color: 'text-brand' },
          { label: 'Хочу', value: stats.total_want, color: 'text-blue-500' },
          { label: 'Пропущено', value: stats.total_skipped, color: 'text-gray-400' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-3 text-center border border-[#f0ebe4]">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Average score */}
      {stats.average_score && (
        <div className="bg-white rounded-xl p-4 border border-[#f0ebe4] text-center">
          <p className="text-xs text-gray-400 mb-1">Середня оцінка</p>
          <p className="font-serif text-4xl text-brand font-bold">{stats.average_score}</p>
          <p className="text-xs text-gray-400">/ 10</p>
        </div>
      )}

      {noData ? (
        <div className="text-center text-gray-400 py-12">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm">Статистика з'явиться після перших оцінок</p>
        </div>
      ) : (
        <>
          {/* Score distribution */}
          {stats.score_distribution.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-[#f0ebe4]">
              <p className="text-sm font-semibold text-gray-700 mb-3">Розподіл оцінок</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={stats.score_distribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="score" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip formatter={(v) => [v, 'Фільмів']} />
                  <Bar dataKey="count" fill="#e8335a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top genres */}
          {stats.top_genres.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-[#f0ebe4]">
              <p className="text-sm font-semibold text-gray-700 mb-3">Улюблені жанри</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={stats.top_genres} dataKey="count" nameKey="genre" cx="50%" cy="50%" outerRadius={60} label={({ genre }) => genre}>
                    {stats.top_genres.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}
