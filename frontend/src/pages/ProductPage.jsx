import { useParams, Link, useNavigate } from 'react-router-dom'
import { products } from '../data/products.js'
import './ProductPage.css'

const careColors = { легко: '#4caf50', средне: '#ff9800', сложно: '#f44336' }

export default function ProductPage({ favorites, onToggleFavorite, onAddToCart }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const product = products.find((p) => p.id === Number(id))

  if (!product) {
    return (
      <div className="product-page product-page--not-found">
        <div className="container">
          <p>Товар не найден</p>
          <Link to="/catalog" className="btn btn-primary">В каталог</Link>
        </div>
      </div>
    )
  }

  const isFav = favorites?.includes(product.id)

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3)

  return (
    <div className="product-page">
      <div className="container">

        {/* Хлебные крошки */}
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb__link">Главная</Link>
          <span className="breadcrumb__sep">›</span>
          <Link to="/catalog" className="breadcrumb__link">Каталог</Link>
          <span className="breadcrumb__sep">›</span>
          <span>{product.name}</span>
        </nav>

        {/* Основной блок */}
        <div className="product-main">
          <div className="product-main__gallery">
            <img
              src={product.image}
              alt={product.name}
              className="product-main__img"
            />
          </div>

          <div className="product-main__info">
            <span className="product-main__category">{product.categoryName}</span>
            <h1 className="product-main__name">{product.name}</h1>

            {/* Характеристики */}
            <ul className="product-specs">
              <li className="product-specs__item">
                <span className="product-specs__label">Высота</span>
                <span className="product-specs__value">{product.height}</span>
              </li>
              <li className="product-specs__item">
                <span className="product-specs__label">Освещение</span>
                <span className="product-specs__value">{product.light}</span>
              </li>
              <li className="product-specs__item">
                <span className="product-specs__label">Полив</span>
                <span className="product-specs__value">{product.watering}</span>
              </li>
              <li className="product-specs__item">
                <span className="product-specs__label">Уход</span>
                <span
                  className="product-specs__value product-specs__care"
                  style={{ color: careColors[product.care] }}
                >
                  {product.care}
                </span>
              </li>
            </ul>

            <p className="product-main__desc">{product.description}</p>

            <div className="product-main__price">{product.price} ₽</div>

            <div className="product-main__actions">
              <button
                className="btn btn-primary product-main__cart-btn"
                onClick={() => { onAddToCart(product); navigate('/cart') }}
              >
                В корзину
              </button>
              <button
                className={`product-main__fav-btn ${isFav ? 'product-main__fav-btn--active' : ''}`}
                onClick={() => onToggleFavorite(product.id)}
                aria-label={isFav ? 'Убрать из избранного' : 'В избранное'}
              >
                {isFav ? '♥' : '♡'}
              </button>
            </div>
          </div>
        </div>

        {/* Похожие товары */}
        {related.length > 0 && (
          <section className="product-related">
            <h2 className="product-related__title">Похожие растения</h2>
            <div className="product-related__grid">
              {related.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="product-related__card">
                  <img src={p.image} alt={p.name} className="product-related__img" />
                  <p className="product-related__name">{p.name}</p>
                  <p className="product-related__price">{p.price} ₽</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
