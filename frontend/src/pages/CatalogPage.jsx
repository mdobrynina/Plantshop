import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Catalog/Sidebar.jsx'
import ProductCard from '../components/ProductCard/ProductCard.jsx'
import { products } from '../data/products.js'
import './CatalogPage.css'

const SORT_OPTIONS = [
  { value: 'popular',   label: 'По популярности' },
  { value: 'price_asc', label: 'Сначала дешёвые' },
  { value: 'price_desc', label: 'Сначала дорогие' },
  { value: 'name',      label: 'По алфавиту' },
]

const CARE_OPTIONS = ['легко', 'средне', 'сложно']

export default function CatalogPage({ favorites, onToggleFavorite, onAddToCart }) {
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('category')
  const query = searchParams.get('q')?.toLowerCase().trim() ?? ''

  const [sort,         setSort]        = useState('popular')
  const [careFilters,  setCareFilters] = useState([])
  const [maxPrice,     setMaxPrice]    = useState('')
  const [filtersOpen,  setFiltersOpen] = useState(false)

  const toggleCare = (c) =>
    setCareFilters((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    )

  const resetFilters = () => { setCareFilters([]); setMaxPrice('') }

  const filtered = products
    .filter((p) => (activeCategory ? p.category === activeCategory : true))
    .filter((p) => (query ? p.name.toLowerCase().includes(query) || p.categoryName.toLowerCase().includes(query) : true))
    .filter((p) => (careFilters.length ? careFilters.includes(p.care) : true))
    .filter((p) => (maxPrice ? p.price <= Number(maxPrice) : true))
    .sort((a, b) => {
      if (sort === 'price_asc')  return a.price - b.price
      if (sort === 'price_desc') return b.price - a.price
      if (sort === 'name')       return a.name.localeCompare(b.name, 'ru')
      return 0
    })

  const title = query
    ? `Результаты поиска: «${searchParams.get('q')}»`
    : activeCategory
      ? filtered[0]?.categoryName ?? products.find((p) => p.category === activeCategory)?.categoryName ?? 'Каталог'
      : 'Популярные растения'

  const hasActiveFilters = careFilters.length > 0 || maxPrice

  return (
    <div className="catalog-page">
      <div className="container catalog-page__inner">
        <Sidebar />

        <main className="catalog-main">
          <div className="catalog-toolbar">
            <h2 className="catalog-main__title">{title}</h2>

            <div className="catalog-toolbar__right">
              {/* Кнопка фильтров */}
              <button
                className={`catalog-filter-btn ${hasActiveFilters ? 'catalog-filter-btn--active' : ''}`}
                onClick={() => setFiltersOpen((v) => !v)}
              >
                ⚙ Фильтры {hasActiveFilters && `(${careFilters.length + (maxPrice ? 1 : 0)})`}
              </button>

              {/* Сортировка */}
              <select
                className="catalog-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Панель фильтров */}
          {filtersOpen && (
            <div className="catalog-filters">
              <div className="catalog-filters__group">
                <p className="catalog-filters__label">Сложность ухода</p>
                <div className="catalog-filters__chips">
                  {CARE_OPTIONS.map((c) => (
                    <button
                      key={c}
                      className={`catalog-chip ${careFilters.includes(c) ? 'catalog-chip--active' : ''}`}
                      onClick={() => toggleCare(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="catalog-filters__group">
                <p className="catalog-filters__label">Цена до (₽)</p>
                <input
                  type="number"
                  className="catalog-filters__price"
                  placeholder="Например: 1500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min={0}
                />
              </div>

              {hasActiveFilters && (
                <button className="catalog-filters__reset" onClick={resetFilters}>
                  Сбросить фильтры
                </button>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="catalog-main__empty">
              <p>🌿 Ничего не найдено</p>
              <p>Попробуй изменить фильтры или выбрать другую категорию</p>
              {hasActiveFilters && (
                <button className="btn btn-secondary" onClick={resetFilters}>Сбросить фильтры</button>
              )}
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
