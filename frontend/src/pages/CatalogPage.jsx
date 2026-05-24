import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Catalog/Sidebar.jsx'
import ProductCard from '../components/ProductCard/ProductCard.jsx'
import { api } from '../api/api.js'
import './CatalogPage.css'

const SORT_OPTIONS = [
  { value: 'popular',    label: 'По популярности' },
  { value: 'price_asc',  label: 'Сначала дешёвые' },
  { value: 'price_desc', label: 'Сначала дорогие' },
  { value: 'name',       label: 'По алфавиту' },
]

const CARE_OPTIONS = ['легко', 'средне', 'сложно']

export default function CatalogPage({ favorites, onToggleFavorite, onAddToCart }) {
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('category')
  const query = searchParams.get('q')?.toLowerCase().trim() ?? ''

  const [sort,        setSort]        = useState('popular')
  const [careFilters, setCareFilters] = useState([])
  const [maxPrice,    setMaxPrice]    = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [products,    setProducts]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (activeCategory) params.set('category', activeCategory)
    if (query)          params.set('q', query)
    api.get(`/products?${params}`)
      .then(setProducts)
      .catch(() => setError('Не удалось загрузить товары. Проверь, что бэкенд запущен.'))
      .finally(() => setLoading(false))
  }, [activeCategory, query])

  const toggleCare  = (c) =>
    setCareFilters((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])
  const resetFilters = () => { setCareFilters([]); setMaxPrice('') }

  const filtered = products
    .filter((p) => careFilters.length ? careFilters.includes(p.care) : true)
    .filter((p) => maxPrice ? p.price <= Number(maxPrice) : true)
    .sort((a, b) => {
      if (sort === 'price_asc')  return a.price - b.price
      if (sort === 'price_desc') return b.price - a.price
      if (sort === 'name')       return a.name.localeCompare(b.name, 'ru')
      return 0
    })

  const title = query
    ? `Результаты поиска: «${searchParams.get('q')}»`
    : activeCategory
      ? filtered[0]?.categoryName ?? 'Каталог'
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
              <button
                className={`catalog-filter-btn ${hasActiveFilters ? 'catalog-filter-btn--active' : ''}`}
                onClick={() => setFiltersOpen((v) => !v)}
              >
                ⚙ Фильтры {hasActiveFilters && `(${careFilters.length + (maxPrice ? 1 : 0)})`}
              </button>
              <select className="catalog-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

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
                  type="number" className="catalog-filters__price"
                  placeholder="Например: 1500" value={maxPrice} min={0}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              {hasActiveFilters && (
                <button className="catalog-filters__reset" onClick={resetFilters}>Сбросить фильтры</button>
              )}
            </div>
          )}

          {loading && (
            <div className="catalog-main__empty"><p>🌿 Загружаем растения...</p></div>
          )}
          {error && (
            <div className="catalog-main__empty">
              <p>⚠️ {error}</p>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="catalog-main__empty">
              <p>🌿 Ничего не найдено</p>
              <p>Попробуй изменить фильтры или выбрать другую категорию</p>
              {hasActiveFilters && (
                <button className="btn btn-secondary" onClick={resetFilters}>Сбросить фильтры</button>
              )}
            </div>
          )}
          {!loading && !error && filtered.length > 0 && (
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
