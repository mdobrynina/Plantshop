import './Reviews.css'

const reviews = [
  {
    name: 'Алина Петрова',
    rating: 5,
    text: 'Заказывала монстеру — пришла в идеальном состоянии, упакована как произведение искусства. Буду заказывать снова!',
  },
  {
    name: 'Михаил Соколов',
    rating: 5,
    text: 'Отличный магазин! Растение приехало живое и здоровое. Консультант помог выбрать под мои условия освещения.',
  },
  {
    name: 'Анна Петрова',
    rating: 5,
    text: 'Уже третий заказ подряд. Качество всегда на высоте, доставка быстрая. Рекомендую всем любителям растений!',
  },
]

function Stars({ count }) {
  return (
    <div className="review-card__stars" aria-label={`${count} из 5 звёзд`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? 'star star--filled' : 'star'}>★</span>
      ))}
    </div>
  )
}

export default function Reviews() {
  return (
    <section className="reviews" id="reviews">
      <div className="container">
        <h2 className="reviews__title">Отзывы о нас</h2>
        <p className="reviews__subtitle">
          Нам приятно, когда клиенты делятся своими впечатлениями
        </p>
        <div className="reviews__grid">
          {reviews.map((r) => (
            <div key={r.name} className="review-card">
              <Stars count={r.rating} />
              <p className="review-card__text">«{r.text}»</p>
              <span className="review-card__author">{r.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
