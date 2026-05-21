import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard/ProductCard.jsx'
import { products } from '../data/products.js'
import './FavoritesPage.css'

export default function FavoritesPage({ favorites, onToggleFavorite, onAddToCart }) {
  const favProducts = products.filter((p) => favorites.includes(p.id))

  return (
    <div className="favorites-page">
      <div className="container">
        <h1 className="favorites-page__title">Избранное</h1>

        {favProducts.length === 0 ? (
          <div className="favorites-page__empty">
            <p>Вы ещё не добавили ни одного растения в избранное</p>
            <Link to="/catalog" className="btn btn-primary">Перейти в каталог</Link>
          </div>
        ) : (
          <div className="favorites-page__grid">
            {favProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite
                onToggleFavorite={onToggleFavorite}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
