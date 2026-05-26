import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { api } from '../api/api.js'
import './AuthPage.css'

const QUICK_ACCOUNTS = [
  { label: 'Админ',    email: 'admin@moh.ru',   password: 'admin123' },
  { label: 'Флорист',  email: 'florist@moh.ru', password: 'florist123' },
]

export default function LoginPage({ onLogin }) {
  const [form,     setForm]     = useState({ email: '', password: '' })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [notFound, setNotFound] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from || null

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: '', server: '' }))
    setNotFound(false)
  }

  const quickFill = (acc) => {
    setForm({ email: acc.email, password: acc.password })
    setErrors({})
    setNotFound(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = {}
    if (!form.email.includes('@')) e2.email = 'Введите корректный email'
    if (!form.password) e2.password = 'Введите пароль'
    if (Object.keys(e2).length > 0) { setErrors(e2); return }

    setLoading(true)
    try {
      const data = await api.post('/auth/login', { email: form.email, password: form.password })
      onLogin(data)
      if (data.role === 'ADMIN')        navigate('/admin')
      else if (data.role === 'FLORIST') navigate('/florist')
      else                              navigate(from || '/profile')
    } catch {
      setNotFound(true)
      setErrors({ server: 'Неверный email или пароль' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-page__bg" />
      <div className="auth-card">
        <h1 className="auth-card__title">Войти</h1>

        {/* Быстрый вход для тестирования */}
        <div className="auth-quick">
          {QUICK_ACCOUNTS.map(acc => (
            <button key={acc.email} type="button" className="auth-quick__btn" onClick={() => quickFill(acc)}>
              {acc.label}
            </button>
          ))}
        </div>

        {errors.server && (
          <div style={{ marginBottom: '12px' }}>
            <p className="auth-form__server-error">{errors.server}</p>
            {notFound && (
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                Нет аккаунта?{' '}
                <Link to={`/register?email=${encodeURIComponent(form.email)}`} className="auth-form__link" style={{ fontWeight: 600 }}>
                  Зарегистрироваться →
                </Link>
              </p>
            )}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <input type="email" placeholder="Электронная почта"
              className={`auth-form__input ${errors.email ? 'auth-form__input--error' : ''}`}
              value={form.email} onChange={set('email')} autoComplete="email" />
            {errors.email && <span className="auth-form__error">{errors.email}</span>}
          </div>

          <div className="auth-form__field">
            <input type="password" placeholder="Пароль"
              className={`auth-form__input ${errors.password ? 'auth-form__input--error' : ''}`}
              value={form.password} onChange={set('password')} autoComplete="current-password" />
            {errors.password && <span className="auth-form__error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary auth-form__submit" disabled={loading}>
            {loading ? 'Вхожу...' : 'Войти'}
          </button>
        </form>

        {!notFound && (
          <p className="auth-card__footer">
            Нет аккаунта?{' '}
            <Link to="/register" className="auth-form__link">Зарегистрироваться</Link>
          </p>
        )}
      </div>
    </div>
  )
}
