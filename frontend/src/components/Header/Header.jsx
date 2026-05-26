import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { api } from '../../api/api.js'
import './Header.css'

const navLinks = [
  { label: 'Каталог',      to: '/catalog' },
  { label: 'Преимущества', to: '/#advantages' },
  { label: 'О нас',        to: '/#about' },
  { label: 'Доставка',     to: '/#delivery' },
  { label: 'Отзывы',       to: '/#reviews' },
  { label: 'Контакты',     to: '/#contacts' },
]

const STAFF_CONFIG = {
  ADMIN:   { to: '/admin',   label: 'Панель администратора', badge: 'ADMIN',   color: '#c62828' },
  FLORIST: { to: '/florist', label: 'Рабочий стол',          badge: 'FLORIST', color: '#3949ab' },
}

const ROLE_PANEL = {}

function LogoutConfirm({ onConfirm, onCancel }) {
  return (
    <div className="logout-overlay" onClick={onCancel}>
      <div className="logout-modal" onClick={e => e.stopPropagation()}>
        <p className="logout-modal__text">Выйти из аккаунта?</p>
        <div className="logout-modal__actions">
          <button className="btn btn-primary"   onClick={onConfirm}>Выйти</button>
          <button className="btn btn-secondary" onClick={onCancel}>Отмена</button>
        </div>
      </div>
    </div>
  )
}

function StaffHeader({ user, onLogout }) {
  const [confirm, setConfirm] = useState(false)
  const cfg = STAFF_CONFIG[user.role]
  return (
    <>
      <header className="header header--staff">
        <div className="container header__inner">
          <Link to={cfg.to} className="header__logo">
            <img src="/images/logo.svg" alt="moh" className="header__logo-img" />
          </Link>
          <div className="staff-header__center">
            <span className="staff-header__badge" style={{ background: cfg.color }}>{cfg.badge}</span>
            <span className="staff-header__title">{cfg.label}</span>
          </div>
          <div className="staff-header__right">
            <span className="staff-header__name">{user.fullName}</span>
            <button className="staff-header__logout" onClick={() => setConfirm(true)}>Выйти</button>
          </div>
        </div>
      </header>
      {confirm && <LogoutConfirm onConfirm={onLogout} onCancel={() => setConfirm(false)} />}
    </>
  )
}

export default function Header({ favCount = 0, cartCount = 0, user = null, onLogout }) {
  if (user?.role === 'ADMIN' || user?.role === 'FLORIST') {
    return <StaffHeader user={user} onLogout={onLogout} />
  }

  const isLoggedIn = !!user
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [query,        setQuery]        = useState('')
  const [scrolled,     setScrolled]     = useState(false)
  const [confirm,      setConfirm]      = useState(false)
  const [suggestions,  setSuggestions]  = useState([])
  const [showSug,      setShowSug]      = useState(false)
  const menuRef  = useRef(null)
  const searchRef = useRef(null)
  const sugTimer = useRef(null)
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

  useEffect(() => { setMobileOpen(false) }, [navigate])

  // Закрывать подсказки при клике вне поиска
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSug(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleQueryChange = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(sugTimer.current)
    if (val.trim().length < 2) { setSuggestions([]); setShowSug(false); return }
    sugTimer.current = setTimeout(() => {
      api.get(`/products?q=${encodeURIComponent(val.trim())}`)
        .then(res => {
          setSuggestions((res ?? []).slice(0, 6))
          setShowSug(true)
        })
        .catch(() => {})
    }, 250)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(query.trim())}`)
      setQuery('')
      setShowSug(false)
    }
  }

  const pickSuggestion = (product) => {
    navigate(`/product/${product.id}`)
    setQuery('')
    setShowSug(false)
  }

  const handleLogout = () => {
    setConfirm(false)
    setMenuOpen(false)
    setMobileOpen(false)
    onLogout?.()
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
              <NavLink key={link.to} to={link.to}
                className={({ isActive }) =>
                  `header__nav-link${isActive && link.to === '/catalog' ? ' header__nav-link--active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="header__actions">
            <form onSubmit={handleSearch} className="header__search-form" ref={searchRef}>
              <input type="search" placeholder="Поиск по растениям"
                className="header__search" value={query}
                onChange={handleQueryChange}
                onFocus={() => suggestions.length > 0 && setShowSug(true)}
                autoComplete="off"
              />
              <button type="submit" className="header__search-btn" aria-label="Найти">🔍</button>
              {showSug && suggestions.length > 0 && (
                <div className="header__suggestions">
                  {suggestions.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className="header__suggestion-item"
                      onMouseDown={() => pickSuggestion(p)}
                    >
                      {p.image && <img src={p.image} alt="" className="header__suggestion-img" />}
                      <span className="header__suggestion-name">{p.name}</span>
                      <span className="header__suggestion-price">{Number(p.price).toLocaleString('ru')} ₽</span>
                    </button>
                  ))}
                </div>
              )}
            </form>

            <Link to="/favorites" className="header__icon-btn" aria-label="Избранное">
              ♥ {favCount > 0 && <span className="header__badge">{favCount}</span>}
            </Link>

            <Link to="/cart" className="header__icon-btn" aria-label="Корзина">
              🛒 {cartCount > 0 && <span className="header__badge">{cartCount}</span>}
            </Link>

            <div className="header__menu-wrap" ref={menuRef}>
              <button className="header__icon-btn" aria-label="Меню"
                onClick={() => setMenuOpen((v) => !v)}>☰</button>
              {menuOpen && (
                <div className="header__dropdown">
                  {isLoggedIn ? (
                    <>
                      <Link to="/profile" className="header__dropdown-item"
                        onClick={() => setMenuOpen(false)}>
                        <span>👤</span> Профиль
                      </Link>
                      {ROLE_PANEL[user?.role] && (
                        <Link to={ROLE_PANEL[user.role].to}
                          className="header__dropdown-item header__dropdown-item--panel"
                          onClick={() => setMenuOpen(false)}>
                          {ROLE_PANEL[user.role].label}
                        </Link>
                      )}
                      <button className="header__dropdown-item header__dropdown-item--btn"
                        onClick={() => { setMenuOpen(false); setConfirm(true) }}>
                        <span>🚪</span> Выйти
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="header__dropdown-item"
                        onClick={() => setMenuOpen(false)}><span>🔑</span> Войти</Link>
                      <Link to="/register" className="header__dropdown-item"
                        onClick={() => setMenuOpen(false)}><span>✏️</span> Регистрация</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <button className="header__burger" aria-label="Открыть меню"
              onClick={() => setMobileOpen((v) => !v)}>
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="mobile-menu">
          <nav className="mobile-menu__nav">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className="mobile-menu__link"
                onClick={() => setMobileOpen(false)}>{link.label}</NavLink>
            ))}
          </nav>
          <div className="mobile-menu__auth">
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="mobile-menu__link"
                  onClick={() => setMobileOpen(false)}>👤 Профиль</Link>
                <button className="mobile-menu__link"
                  onClick={() => { setMobileOpen(false); setConfirm(true) }}>🚪 Выйти</button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-menu__link"
                  onClick={() => setMobileOpen(false)}>🔑 Войти</Link>
                <Link to="/register" className="mobile-menu__link"
                  onClick={() => setMobileOpen(false)}>✏️ Регистрация</Link>
              </>
            )}
          </div>
        </div>
      )}

      {confirm && <LogoutConfirm onConfirm={handleLogout} onCancel={() => setConfirm(false)} />}
    </>
  )
}
