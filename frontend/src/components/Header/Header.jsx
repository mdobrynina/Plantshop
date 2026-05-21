import { useState, useRef, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Header.css'

const navLinks = [
  { label: 'Каталог',      to: '/catalog' },
  { label: 'Преимущества', to: '/#advantages' },
  { label: 'О нас',        to: '/#about' },
  { label: 'Доставка',     to: '/#delivery' },
  { label: 'Отзывы',       to: '/#reviews' },
  { label: 'Контакты',     to: '/#contacts' },
]

export default function Header({ favCount = 0, cartCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Закрывать дропдаун при клике за его пределами
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo">
          <img src="/images/logo.svg" alt="moh" className="header__logo-img" />
        </Link>

        <nav className="header__nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `header__nav-link${isActive && link.to === '/catalog' ? ' header__nav-link--active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="header__actions">
          <input
            type="search"
            placeholder="Поиск по растениям"
            className="header__search"
          />
          <Link to="/favorites" className="header__icon-btn" aria-label="Избранное">
            ♥
            {favCount > 0 && <span className="header__badge">{favCount}</span>}
          </Link>
          <Link to="/cart" className="header__icon-btn" aria-label="Корзина">
            🛒
            {cartCount > 0 && <span className="header__badge">{cartCount}</span>}
          </Link>

          {/* Меню входа */}
          <div className="header__menu-wrap" ref={menuRef}>
            <button
              className="header__icon-btn"
              aria-label="Меню пользователя"
              onClick={() => setMenuOpen((v) => !v)}
            >
              ☰
            </button>
            {menuOpen && (
              <div className="header__dropdown">
                <Link
                  to="/profile"
                  className="header__dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="header__dropdown-icon">👤</span> Профиль
                </Link>
                <Link
                  to="/login"
                  className="header__dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="header__dropdown-icon">🔑</span> Войти
                </Link>
                <Link
                  to="/register"
                  className="header__dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="header__dropdown-icon">✏️</span> Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
