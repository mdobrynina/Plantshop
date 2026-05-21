import { useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Catalog/Sidebar.jsx'
import ProductCard from '../components/ProductCard/ProductCard.jsx'
import { products } from '../data/products.js'
import './CatalogPage.css'

export default function CatalogPage({ favorites, onToggleFavorite, onAddToCart }) {
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('category')
  const query = searchParams.get('q')?.toLowerCase().trim() ?? ''

  const filtered = products.filter((p) => {
    const matchCat = activeCategory ? p.category === activeCategory : true
    const matchQ   = query
      ? p.name.toLowerCase().includes(query) || p.categoryName.toLowerCase().includes(query)
      : true
    return matchCat && matchQ
  })

  const title = query
    ? `Результаты поиска: «${searchParams.get('q')}»`
    : activeCategory
      ? filtered[0]?.categoryName ?? 'Каталог'
      : 'Популярные растения'

  return (
    <div className="catalog-page">
      <div className="container catalog-page__inner">
        <Sidebar />

        <main className="catalog-main">
          <h2 className="catalog-main__title">{title}</h2>

          {filtered.length === 0 ? (
            <div className="catalog-main__empty">
              <p>🌿 Ничего не найдено</p>
              <p>Попробуй другой запрос или выбери категорию из меню</p>
            </div>
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
