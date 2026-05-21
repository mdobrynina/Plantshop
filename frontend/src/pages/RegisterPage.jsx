import { useState } from 'react'
import { Link } from 'react-router-dom'
import './AuthPage.css'

export default function RegisterPage({ onLogin }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    password: '',
    confirmPassword: '',
    subscribe: false,
    agree: false,
  })
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Введите имя'
    if (!form.lastName.trim()) e.lastName = 'Введите фамилию'
    if (!form.email.includes('@')) e.email = 'Введите корректный email'
    if (form.password.length < 6) e.password = 'Минимум 6 символов'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Пароли не совпадают'
    if (!form.agree) e.agree = 'Необходимо принять условия'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }
    // TODO: отправка на Spring Boot backend
    onLogin?.()
    alert('Регистрация успешна! (заглушка — подключим backend позже)')
  }

  return (
    <div className="auth-page">
      <div className="auth-page__bg" />
      <div className="auth-card">
        <h1 className="auth-card__title">Регистрация</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <input
              type="text"
              placeholder="Имя"
              className={`auth-form__input ${errors.firstName ? 'auth-form__input--error' : ''}`}
              value={form.firstName}
              onChange={set('firstName')}
            />
            {errors.firstName && <span className="auth-form__error">{errors.firstName}</span>}
          </div>

          <div className="auth-form__field">
            <input
              type="text"
              placeholder="Фамилия"
              className={`auth-form__input ${errors.lastName ? 'auth-form__input--error' : ''}`}
              value={form.lastName}
              onChange={set('lastName')}
            />
            {errors.lastName && <span className="auth-form__error">{errors.lastName}</span>}
          </div>

          <div className="auth-form__field">
            <input
              type="date"
              placeholder="Дата рождения"
              className="auth-form__input"
              value={form.birthDate}
              onChange={set('birthDate')}
            />
          </div>

          <div className="auth-form__field">
            <input
              type="email"
              placeholder="Электронная почта"
              className={`auth-form__input ${errors.email ? 'auth-form__input--error' : ''}`}
              value={form.email}
              onChange={set('email')}
            />
            {errors.email && <span className="auth-form__error">{errors.email}</span>}
          </div>

          <div className="auth-form__field">
            <input
              type="password"
              placeholder="Придумайте пароль"
              className={`auth-form__input ${errors.password ? 'auth-form__input--error' : ''}`}
              value={form.password}
              onChange={set('password')}
            />
            {errors.password && <span className="auth-form__error">{errors.password}</span>}
          </div>

          <div className="auth-form__field">
            <input
              type="password"
              placeholder="Повторите пароль"
              className={`auth-form__input ${errors.confirmPassword ? 'auth-form__input--error' : ''}`}
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
            />
            {errors.confirmPassword && <span className="auth-form__error">{errors.confirmPassword}</span>}
          </div>

          <label className="auth-form__check">
            <input type="checkbox" checked={form.subscribe} onChange={set('subscribe')} />
            <span>Хочу получать советы по уходу и персональные предложения</span>
          </label>

          <label className={`auth-form__check ${errors.agree ? 'auth-form__check--error' : ''}`}>
            <input type="checkbox" checked={form.agree} onChange={set('agree')} />
            <span>
              Я согласен(на) с{' '}
              <a href="#" className="auth-form__link">условиями использования и политикой конфиденциальности</a>
            </span>
          </label>
          {errors.agree && <span className="auth-form__error">{errors.agree}</span>}

          <button type="submit" className="btn btn-primary auth-form__submit">
            Зарегистрироваться
          </button>
        </form>

        <p className="auth-card__footer">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="auth-form__link">Войти</Link>
        </p>
      </div>
    </div>
  )
}
