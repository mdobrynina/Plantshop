import Reveal from '../Reveal/Reveal.jsx'
import './About.css'

export default function About() {
  return (
    <section className="about" id="about">
      <div className="container about__inner">
        <Reveal><div className="about__content">
          <h2 className="about__title">О нас</h2>
          <p className="about__lead">
            moh — это интернет-магазин растений с душой, где каждый
            листочек находит свой дом
          </p>
          <p className="about__text">
            Мы верим, что городская жизнь не должна быть серой. Зелень — это
            не роскошь, а необходимость. Наша миссия — сделать растения
            доступными, прививая любовь к растениям даже тем, у кого её не
            было раньше.
          </p>
          <a href="#catalog" className="btn btn-primary">Начать покупку</a>
        </div></Reveal>

        <Reveal delay={1}><div className="about__image">
          <img src="/images/главная2.png" alt="О нас" />
        </div></Reveal>
      </div>
    </section>
  )
}
