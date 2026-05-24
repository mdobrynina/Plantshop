import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/api.js'
import './AuthPage.css'

export default function LoginPage({ onLogin }) {
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: '', server: '' }))
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
      if (data.role === 'ADMIN')   navigate('/admin')
      else if (data.role === 'FLORIST') navigate('/florist')
      else navigate('/profile')
    } catch (err) {
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

        {errors.server && <p className="auth-form__server-error">{errors.server}</p>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <input
              type="email"
              placeholder="Электронная почта"
              className={`auth-form__input ${errors.email ? 'auth-form__input--error' : ''}`}
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
            />
            {errors.email && <span className="auth-form__error">{errors.email}</span>}
          </div>

          <div className="auth-form__field">
            <input
              type="password"
              placeholder="Пароль"
              className={`auth-form__input ${errors.password ? 'auth-form__input--error' : ''}`}
              value={form.password}
              onChange={set('password')}
              autoComplete="current-password"
            />
            {errors.password && <span className="auth-form__error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary auth-form__submit" disabled={loading}>
            {loading ? 'Вхожу...' : 'Войти'}
          </button>
        </form>

        <p className="auth-card__footer">
          Нет аккаунта?{' '}
          <Link to="/register" className="auth-form__link">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}
