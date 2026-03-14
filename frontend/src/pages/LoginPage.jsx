import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Помилка входу')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0eb] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-4xl text-center mb-2">CineSwipe</h1>
        <p className="text-center text-gray-500 text-sm mb-8">Знайди свій наступний фільм</p>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f0ebe4]">
          <h2 className="text-lg font-semibold mb-4">Вхід</h2>
          {error && <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded-lg">{error}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="border border-[#e0d8d0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand"
              required
            />
            <input
              type="password"
              placeholder="Пароль"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="border border-[#e0d8d0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand"
              required
            />
            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? 'Входимо...' : 'Увійти'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Немає акаунту?{' '}
            <Link to="/register" className="text-brand font-medium">Зареєструватись</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
