import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer" id="contacts">
      <div className="container footer__inner">
        <div className="footer__col">
          <img src="/images/logo.svg" alt="moh" className="footer__logo-img" />
          <p className="footer__tagline">Природа в твоём доме</p>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">Навигация</h4>
          <a href="#catalog" className="footer__link">Каталог</a>
          <a href="#about" className="footer__link">О нас</a>
          <a href="#delivery" className="footer__link">Доставка</a>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">Контакты</h4>
          <p className="footer__text">Тел. 8 (800) 555-35-35</p>
          <p className="footer__text">hello@moh.shop</p>
        </div>
      </div>
      <div className="footer__bottom">
        © {new Date().getFullYear()} moh.shop
      </div>
    </footer>
  )
}
