import { useState } from 'react'

export default function RatingModal({ movie, onConfirm, onCancel }) {
  const [score, setScore] = useState(7)

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-6">
      <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm text-white text-center">
        <p className="text-white/60 text-sm mb-1">Ваша оцінка для</p>
        <p className="font-serif text-xl mb-4">{movie?.title}</p>

        <div className="text-6xl font-serif font-bold text-white mb-4">{score}</div>

        {/* Stars */}
        <div className="flex justify-center gap-1 mb-4">
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              onClick={() => setScore(i + 1)}
              className="text-lg cursor-pointer transition-colors"
              style={{ color: i < score ? '#e8335a' : '#555' }}
            >★</span>
          ))}
        </div>

        {/* Slider */}
        <input
          type="range"
          min="1" max="10" step="1"
          value={score}
          onChange={e => setScore(Number(e.target.value))}
          className="w-full mb-5 accent-brand"
        />

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 text-sm"
          >Скасувати</button>
          <button
            onClick={() => onConfirm(score)}
            className="flex-1 py-3 rounded-xl bg-brand text-white font-semibold text-sm"
          >Підтвердити</button>
        </div>
      </div>
    </div>
  )
}
