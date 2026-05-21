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
        </div>
      </div>
    </header>
  )
}
