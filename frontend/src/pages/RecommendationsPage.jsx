import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function RecommendationsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/ai/recommendations')
      .then(({ data }) => { setData(data); setFetched(true) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  // Format markdown-like text to JSX
  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-gray-800 mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>
      }
      if (line.match(/^\d+\./)) {
        const parts = line.split('**')
        return (
          <div key={i} className="bg-white rounded-xl p-3 mb-2 border border-[#f0ebe4]">
            {parts.map((p, j) => j % 2 === 1 ? <span key={j} className="font-semibold text-brand">{p}</span> : <span key={j}>{p}</span>)}
          </div>
        )
      }
      return line ? <p key={i} className="text-sm text-gray-600 mb-1">{line.replace(/\*\*/g, '')}</p> : <div key={i} className="h-2" />
    })
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">✨</span>
        <div>
          <h2 className="font-semibold text-gray-800">AI-рекомендації</h2>
          <p className="text-xs text-gray-400">На основі твоїх оцінок</p>
        </div>
      </div>

      {!fetched && (
        <div className="bg-white rounded-2xl p-6 border border-[#f0ebe4] text-center">
          <div className="text-4xl mb-3">🤖</div>
          <p className="text-sm text-gray-500 mb-4">
            Claude AI проаналізує твої оцінки та запропонує фільми спеціально для тебе
          </p>
          <button onClick={load} disabled={loading} className="btn-primary">
            {loading ? '⏳ Аналізую...' : '✨ Отримати рекомендації'}
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
          <div className="text-3xl animate-spin">⭐</div>
          <p className="text-sm">Claude аналізує твої вподобання...</p>
        </div>
      )}

      {data && !loading && (
        <div>
          <p className="text-xs text-gray-400 mb-3">На основі {data.based_on} переглянутих фільмів</p>
          <div className="space-y-1">
            {formatText(data.recommendations)}
          </div>
          <button onClick={load} className="btn-outline w-full mt-4 text-sm">
            Оновити рекомендації
          </button>
        </div>
      )}
    </div>
  )
}
