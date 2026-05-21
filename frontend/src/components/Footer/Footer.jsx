import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email.includes('@')) {
      alert('Спасибо! Вы подписались на новости.')
      setEmail('')
    }
  }

  return (
    <footer className="footer" id="contacts">
      <div className="container footer__inner">

        <div className="footer__col footer__col--brand">
          <Link to="/">
            <img src="/images/logo.svg" alt="moh" className="footer__logo-img" />
          </Link>
          <p className="footer__tagline">
            Природа в вашем доме. Живые растения для уюта и гармонии.
          </p>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">Навигация</h4>
          <Link to="/catalog" className="footer__link">Каталог</Link>
          <Link to="/#about" className="footer__link">О нас</Link>
          <Link to="/#delivery" className="footer__link">Доставка</Link>
          <Link to="/#reviews" className="footer__link">Отзывы</Link>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">Контакты</h4>
          <a href="tel:+79001234567" className="footer__link">Тел. +7 (900) 123-45-67</a>
          <a href="mailto:info@moh-plants.ru" className="footer__link">Email: info@moh-plants.ru</a>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">Подписка на новости</h4>
          <p className="footer__sub-text">
            Получайте специальные предложения и советы по уходу за растениями
          </p>
          <form className="footer__subscribe" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Email"
              className="footer__sub-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="footer__sub-btn">OK</button>
          </form>
        </div>

      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>© {new Date().getFullYear()} moh · Plants for soul. Все права защищены.</span>
        </div>
      </div>
    </footer>
  )
}
