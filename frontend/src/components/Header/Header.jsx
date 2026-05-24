import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import './Header.css'

const navLinks = [
  { label: 'Каталог',      to: '/catalog' },
  { label: 'Преимущества', to: '/#advantages' },
  { label: 'О нас',        to: '/#about' },
  { label: 'Доставка',     to: '/#delivery' },
  { label: 'Отзывы',       to: '/#reviews' },
  { label: 'Контакты',     to: '/#contacts' },
]

const ROLE_PANEL = {
  ADMIN:   { to: '/admin',   label: '⚙ Панель администратора' },
  FLORIST: { to: '/florist', label: '🌿 Рабочий стол' },
}

export default function Header({ favCount = 0, cartCount = 0, user = null, onLogout }) {
  const isLoggedIn = !!user
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query,      setQuery]      = useState('')
  const [scrolled,   setScrolled]   = useState(false)
  const menuRef  = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Закрывать мобильное меню при навигации
  useEffect(() => { setMobileOpen(false) }, [navigate])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  return (
    <>
      <header className={`header${scrolled ? ' header--scrolled' : ''}`}>
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
            <form onSubmit={handleSearch} className="header__search-form">
              <input
                type="search"
                placeholder="Поиск по растениям"
                className="header__search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="header__search-btn" aria-label="Найти">🔍</button>
            </form>

            <Link to="/favorites" className="header__icon-btn" aria-label="Избранное">
              ♥
              {favCount > 0 && <span className="header__badge">{favCount}</span>}
            </Link>

            <Link to="/cart" className="header__icon-btn" aria-label="Корзина">
              🛒
              {cartCount > 0 && <span className="header__badge">{cartCount}</span>}
            </Link>

            {/* Дропдаун */}
            <div className="header__menu-wrap" ref={menuRef}>
              <button
                className="header__icon-btn"
                aria-label="Меню"
                onClick={() => setMenuOpen((v) => !v)}
              >
                ☰
              </button>
              {menuOpen && (
                <div className="header__dropdown">
                  {isLoggedIn ? (
                    <>
                      <Link to="/profile" className="header__dropdown-item" onClick={() => setMenuOpen(false)}>
                        <span>👤</span> Профиль
                      </Link>
                      {ROLE_PANEL[user?.role] && (
                        <Link
                          to={ROLE_PANEL[user.role].to}
                          className="header__dropdown-item header__dropdown-item--panel"
                          onClick={() => setMenuOpen(false)}
                        >
                          {ROLE_PANEL[user.role].label}
                        </Link>
                      )}
                      <button className="header__dropdown-item header__dropdown-item--btn" onClick={() => { onLogout?.(); setMenuOpen(false) }}>
                        <span>🚪</span> Выйти
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="header__dropdown-item" onClick={() => setMenuOpen(false)}>
                        <span>🔑</span> Войти
                      </Link>
                      <Link to="/register" className="header__dropdown-item" onClick={() => setMenuOpen(false)}>
                        <span>✏️</span> Регистрация
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Бургер для мобильных */}
            <button
              className="header__burger"
              aria-label="Открыть меню"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      {mobileOpen && (
        <div className="mobile-menu">
          <nav className="mobile-menu__nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="mobile-menu__link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mobile-menu__auth">
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="mobile-menu__link" onClick={() => setMobileOpen(false)}>👤 Профиль</Link>
                {ROLE_PANEL[user?.role] && (
                  <Link to={ROLE_PANEL[user.role].to} className="mobile-menu__link" onClick={() => setMobileOpen(false)}>
                    {ROLE_PANEL[user.role].label}
                  </Link>
                )}
                <button className="mobile-menu__link" onClick={() => { onLogout?.(); setMobileOpen(false) }}>🚪 Выйти</button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-menu__link" onClick={() => setMobileOpen(false)}>🔑 Войти</Link>
                <Link to="/register" className="mobile-menu__link" onClick={() => setMobileOpen(false)}>✏️ Регистрация</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
