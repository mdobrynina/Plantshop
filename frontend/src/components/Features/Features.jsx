import './Features.css'

const features = [
  {
    icon: '🌱',
    title: 'Свежие растения',
    text: 'Все растения отправляются прямо с нашей оранжереи. Вы получаете только здоровые экземпляры.',
  },
  {
    icon: '💬',
    title: 'Поддержка 24/7',
    text: 'Наша команда всегда онлайн — поможем выбрать растение и ответим на вопросы по уходу.',
  },
  {
    icon: '🤝',
    title: 'Тысячи покупателей',
    text: 'Нам доверяют уже тысячи любителей растений по всей России.',
  },
  {
    icon: '💰',
    title: 'Выгодные цены',
    text: 'Покупаем напрямую у производителей — без лишних наценок для вас.',
  },
]

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <h2 className="features__title">В чём наша особенность?</h2>
        <p className="features__subtitle">
          Мы делаем всё, чтобы ваш питомец радовал вас долгие годы
        </p>
        <div className="features__grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-card__icon">{f.icon}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__text">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
