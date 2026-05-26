import { Link } from 'react-router-dom'
import Reveal from '../Reveal/Reveal.jsx'
import './Categories.css'

const categories = [
  { name: 'Антуриумы', img: '/images/антуриум_для_популярного.png', categoryId: 'антуриумы' },
  { name: 'Монстеры',  img: '/images/монстера_для_популярного.svg', categoryId: 'монстеры'  },
  { name: 'Алоказии',  img: '/images/алоказия_для_популярного.svg', categoryId: 'алоказии'  },
]

export default function Categories() {
  return (
    <section className="categories" id="catalog">
      <div className="container">
        <Reveal>
          <h2 className="categories__title">Популярные категории</h2>
          <p className="categories__subtitle">
            Растения этих категорий являются самыми популярными среди наших покупателей
          </p>
        </Reveal>
        <div className="categories__grid">
          {categories.map((cat, i) => (
            <Reveal key={cat.name} delay={i + 1}>
              <Link to={`/catalog?category=${cat.categoryId}`} className="category-card">
                <div className="category-card__img-wrap">
                  <img src={cat.img} alt={cat.name} className="category-card__img" />
                </div>
                <span className="category-card__name">{cat.name}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
