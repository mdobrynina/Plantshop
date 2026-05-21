import Reveal from '../Reveal/Reveal.jsx'
import './Advantages.css'

const items = [
  {
    title: 'Тщательно отобранная коллекция',
    text: 'Мы продаём только растения, которые сами вырастили и проверили. Заботимся о том, чтобы каждое растение было в лучшей форме.',
  },
  {
    title: 'Бережная доставка без стресса',
    text: 'Специальная фиксация и упаковка — растение приедет без единого помятого листика.',
  },
  {
    title: 'Экспертная поддержка 24/7',
    text: 'Купить растение — только начало. Наши консультанты помогут вырастить зелёного друга и ответят на любой вопрос.',
  },
  {
    title: 'Гарантия качества и уверенности',
    text: 'Если с растением что-то пошло не так при транспортировке — оперативно решим вопрос.',
  },
]

export default function Advantages() {
  return (
    <section className="advantages" id="advantages">
      <div className="container advantages__inner">
        <Reveal>
          <div className="advantages__image">
            <img src="/images/monstera.png" alt="Монстера" />
          </div>
        </Reveal>

        <Reveal delay={1}>
        <div className="advantages__content">
          <h2 className="advantages__title">Наши преимущества</h2>
          <p className="advantages__lead">
            Выбрать растение онлайн — это удобно и увлекательно. В нашем
            магазине мы создали не просто сайт, а экосистему для вашего
            будущего зелёного питомца.
          </p>
          <ol className="advantages__list">
            {items.map((item, i) => (
              <li key={i} className="advantages__item">
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
          <a href="#catalog" className="btn btn-primary">Начать покупку</a>
        </div>
        </Reveal>
      </div>
    </section>
  )
}
