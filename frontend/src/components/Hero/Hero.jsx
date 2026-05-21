import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__image">
          <img
            src="/images/monstera.png"
            alt="Монстера — тропическое растение"
            className="hero__img"
          />
        </div>

        <div className="hero__content">
          <h1 className="hero__title">
            moh — природа<br />в твоём доме
          </h1>
          <p className="hero__subtitle">
            Живые растения для уюта, вдохновения и гармонии.
            От миниатюрных кактусов до тропических красавиц.
          </p>
          <div className="hero__actions">
            <a href="#catalog" className="btn btn-primary">Начать покупку</a>
            <a href="#about" className="btn btn-secondary">О нас</a>
          </div>
        </div>
      </div>
    </section>
  )
}
