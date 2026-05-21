import './Header.css'

const navLinks = [
  { label: 'Каталог', href: '#catalog' },
  { label: 'Преимущества', href: '#features' },
  { label: 'О нас', href: '#about' },
  { label: 'Доставка', href: '#delivery' },
  { label: 'Отзывы', href: '#reviews' },
  { label: 'Контакты', href: '#contacts' },
]

export default function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <a href="#" className="header__logo">
          <span className="header__logo-mark">🌿</span>
          <span className="header__logo-text">moh</span>
        </a>

        <nav className="header__nav">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="header__nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <input
            type="search"
            placeholder="Поиск по растениям"
            className="header__search"
          />
          <button className="header__cart" aria-label="Корзина">
            🛒
          </button>
        </div>
      </div>
    </header>
  )
}
