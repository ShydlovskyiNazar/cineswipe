import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NAV = [
  { to: '/', icon: '🎬', label: 'Підібрати' },
  { to: '/watched', icon: '✓', label: 'Переглянуто' },
  { to: '/stats', icon: '📊', label: 'Статистика' },
  { to: '/recommendations', icon: '✨', label: 'AI' },
]

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-[#f5f0eb]">
      {/* Header */}
      <header className="bg-white px-5 py-3 border-b border-[#f0ebe4] flex items-center justify-between sticky top-0 z-30">
        <h1 className="font-serif text-2xl text-gray-900">CineSwipe</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user?.username}</span>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-brand transition-colors">Вийти</button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-[#f0ebe4] flex justify-around py-2 z-30">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                isActive ? 'text-brand' : 'text-gray-400'
              }`
            }
          >
            <span className="text-lg leading-none">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
