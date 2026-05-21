import { Link } from 'react-router-dom'
import './ProductCard.css'

export default function ProductCard({ product, isFavorite, onToggleFavorite, onAddToCart }) {
  return (
    <div className="product-card">
      {/* Прозрачная ссылка на всю карточку */}
      <Link to={`/product/${product.id}`} className="product-card__overlay" aria-label={product.name} />

      <div className="product-card__img-wrap">
        <img src={product.image} alt={product.name} className="product-card__img" />
        <button
          className={`product-card__heart ${isFavorite ? 'product-card__heart--active' : ''}`}
          onClick={() => onToggleFavorite(product.id)}
          aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>

      <div className="product-card__body">
        <div className="product-card__meta">
          <span className="product-card__category">{product.categoryName}</span>
          <span className="product-card__care">Уход: {product.care}</span>
        </div>
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__footer">
          <span className="product-card__price">{product.price} ₽</span>
          <button
            className="btn btn-primary product-card__btn"
            onClick={() => onAddToCart(product)}
          >
            В корзину
          </button>
        </div>
      </div>
    </div>
  )
}
