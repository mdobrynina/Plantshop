import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard/ProductCard.jsx'
import { api } from '../api/api.js'
import './FavoritesPage.css'

export default function FavoritesPage({ favorites, onToggleFavorite, onAddToCart, cart = [] }) {
  const [allProducts, setAllProducts] = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    api.get('/products')
      .then(setAllProducts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const favProducts = allProducts.filter((p) => favorites.includes(p.id))

  return (
    <div className="favorites-page">
      <div className="container">
        <h1 className="favorites-page__title">
          Избранное
          {favProducts.length > 0 && (
            <span className="favorites-page__count">{favProducts.length}</span>
          )}
        </h1>

        {loading ? (
          <div className="favorites-page__empty">
            <p style={{ color: 'var(--color-text-muted)' }}>🌿 Загружаем...</p>
          </div>
        ) : favProducts.length === 0 ? (
          <div className="favorites-page__empty">
            <div className="favorites-page__empty-icon">♡</div>
            <h2 className="favorites-page__empty-title">Здесь пока пусто</h2>
            <p className="favorites-page__empty-text">
              Нажимай ♡ на карточках растений, которые понравились,<br />
              и они появятся здесь
            </p>
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
                inCart={cart.some(i => i.id === product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
