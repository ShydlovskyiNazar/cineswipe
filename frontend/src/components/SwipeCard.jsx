import { useRef, useState } from 'react'

const TMDB_IMG = 'https://image.tmdb.org/t/p/w500'

export default function SwipeCard({ movie, onSwipe, isTop }) {
  const cardRef = useRef(null)
  const [drag, setDrag] = useState({ x: 0, dragging: false })
  const startX = useRef(0)

  const rotation = drag.x * 0.07
  const leftOpacity = drag.x < -20 ? Math.min(1, Math.abs(drag.x) / 100) : 0
  const rightOpacity = drag.x > 20 ? Math.min(1, drag.x / 100) : 0

  const onStart = (clientX) => {
    if (!isTop) return
    startX.current = clientX
    setDrag(d => ({ ...d, dragging: true }))
  }

  const onMove = (clientX) => {
    if (!drag.dragging) return
    setDrag(d => ({ ...d, x: clientX - startX.current }))
  }

  const onEnd = () => {
    if (!drag.dragging) return
    const x = drag.x
    setDrag({ x: 0, dragging: false })
    if (x > 80) onSwipe('watched')
    else if (x < -80) onSwipe('skip')
  }

  const posterUrl = movie.poster_path ? `${TMDB_IMG}${movie.poster_path}` : null
  const genres = movie.genre_ids?.join(',') || ''

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 rounded-2xl overflow-hidden card-shadow select-none"
      style={{
        transform: `translateX(${drag.x}px) rotate(${rotation}deg)`,
        transition: drag.dragging ? 'none' : 'transform 0.3s ease',
        cursor: isTop ? 'grab' : 'default',
        zIndex: isTop ? 10 : 1,
      }}
      onMouseDown={e => onStart(e.clientX)}
      onMouseMove={e => onMove(e.clientX)}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchStart={e => onStart(e.touches[0].clientX)}
      onTouchMove={e => onMove(e.touches[0].clientX)}
      onTouchEnd={onEnd}
    >
      {/* Poster */}
      {posterUrl ? (
        <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" draggable={false} />
      ) : (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-6xl">🎬</div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)' }} />

      {/* TMDB rating badge */}
      <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
        <span className="text-brand">★</span>
        {movie.vote_average?.toFixed(1)}/10
      </div>

      {/* Swipe hints */}
      {isTop && (
        <>
          <div className="absolute top-1/2 left-4 -translate-y-1/2 border-2 border-brand text-brand font-bold text-sm px-3 py-1 rounded-lg"
            style={{ opacity: leftOpacity, transition: 'opacity 0.1s' }}>
            НЕ ДИВИВСЯ
          </div>
          <div className="absolute top-1/2 right-4 -translate-y-1/2 border-2 border-green-400 text-green-400 font-bold text-sm px-3 py-1 rounded-lg"
            style={{ opacity: rightOpacity, transition: 'opacity 0.1s' }}>
            ДИВИВСЯ
          </div>
        </>
      )}

      {/* Movie info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-serif text-xl text-white leading-tight">{movie.title}</h3>
        <p className="text-white/70 text-xs mt-1">{movie.release_date?.slice(0, 4)}</p>
        {movie.overview && (
          <p className="text-white/60 text-xs mt-1 line-clamp-2">{movie.overview}</p>
        )}
      </div>
    </div>
  )
}
