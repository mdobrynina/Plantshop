import { Link } from 'react-router-dom'
import './Categories.css'

const categories = [
  { name: 'Антуриумы', emoji: '🌺', categoryId: 'anthurium' },
  { name: 'Монстеры',  emoji: '🌿', categoryId: 'monstery' },
  { name: 'Алоказии',  emoji: '🍃', categoryId: 'alokasii' },
]

export default function Categories() {
  return (
    <section className="categories" id="catalog">
      <div className="container">
        <h2 className="categories__title">Популярные категории</h2>
        <p className="categories__subtitle">
          Растения этих категорий являются самыми популярными среди наших покупателей
        </p>
        <div className="categories__grid">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/catalog?category=${cat.categoryId}`}
              className="category-card"
            >
              <div className="category-card__leaf">{cat.emoji}</div>
              <span className="category-card__name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
