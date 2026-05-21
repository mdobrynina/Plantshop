import { useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Catalog/Sidebar.jsx'
import ProductCard from '../components/ProductCard/ProductCard.jsx'
import { products } from '../data/products.js'
import './CatalogPage.css'

export default function CatalogPage({ favorites, onToggleFavorite, onAddToCart }) {
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('category')

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products

  return (
    <div className="catalog-page">
      <div className="container catalog-page__inner">
        <Sidebar />

        <main className="catalog-main">
          <h2 className="catalog-main__title">
            {activeCategory ? filtered[0]?.categoryName ?? 'Каталог' : 'Популярные растения'}
          </h2>

          {filtered.length === 0 ? (
            <p className="catalog-main__empty">Нет товаров в этой категории</p>
          ) : (
            <div className="catalog-main__grid">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={onToggleFavorite}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
