import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { api } from '../api/api.js'
import './ProfilePage.css'

const STATUS_COLOR = {
  new:        '#2196f3',
  processing: '#ff9800',
  shipped:    '#9c27b0',
  delivered:  '#4caf50',
  cancelled:  '#e05a5a',
}

const STATUS_LABEL = {
  new:        'Новый',
  processing: 'В обработке',
  shipped:    'В доставке',
  delivered:  'Доставлен',
  cancelled:  'Отменён',
}

const CARE_ICON = { легко: '🟢', средне: '🟡', сложно: '🔴' }

function parseUser(user) {
  if (!user) return { firstName: '', lastName: '', email: '' }
  const parts = (user.fullName ?? '').split(' ')
  return {
    firstName: parts[0] ?? '',
    lastName:  parts[1] ?? '',
    email:     user.email ?? '',
  }
}

export default function ProfilePage({ user, onLogout, favorites }) {
  if (!user) return <Navigate to="/login" replace />

  const parsed = parseUser(user)

  const [tab,     setTab]     = useState('orders')
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({ ...parsed, phone: '', birthDate: '' })
  const [draft,   setDraft]   = useState(profile)

  const [orders,        setOrders]        = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  const [allProducts, setAllProducts] = useState([])

  useEffect(() => {
    api.get('/orders')
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false))

    api.get('/products')
      .then(setAllProducts)
      .catch(() => {})
  }, [])

  const myPlants = (() => {
    const seen = new Set()
    const plants = []
    for (const order of orders) {
      const date = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—'
      for (const item of order.items ?? []) {
        if (!seen.has(item.productId)) {
          seen.add(item.productId)
          const product = allProducts.find((p) => p.id === item.productId)
          plants.push({
            id:          item.productId,
            name:        item.productName ?? product?.name ?? '—',
            purchasedAt: date,
            light:       product?.light    ?? '—',
            watering:    product?.watering ?? '—',
            care:        product?.care     ?? '—',
          })
        }
      }
    }
    return plants
  })()

  const set = (field) => (e) =>
    setDraft((p) => ({ ...p, [field]: e.target.value }))

  const handleSave = (e) => {
    e.preventDefault()
    setProfile(draft)
    setEditing(false)
  }

  const handleCancel = () => { setDraft(profile); setEditing(false) }

  return (
    <div className="profile-page">
      <div className="container profile-layout">

        {/* Левая панель */}
        <aside className="profile-sidebar">
          <div className="profile-avatar">
            {profile.firstName?.[0]}{profile.lastName?.[0]}
          </div>
          <p className="profile-sidebar__name">{profile.firstName} {profile.lastName}</p>
          <p className="profile-sidebar__email">{profile.email}</p>

          <nav className="profile-nav">
            {[
              ['orders', '📦 Мои заказы'],
              ['plants', '🌿 Мои растения'],
              ['data',   '👤 Личные данные'],
            ].map(([key, label]) => (
              <button
                key={key}
                className={`profile-nav__item ${tab === key ? 'profile-nav__item--active' : ''}`}
                onClick={() => setTab(key)}
              >
                {label}
                {key === 'plants' && myPlants.length > 0 && (
                  <span className="profile-nav__badge">{myPlants.length}</span>
                )}
              </button>
            ))}
            <Link to="/favorites" className="profile-nav__item">
              ♥ Избранное
              {favorites?.length > 0 && (
                <span className="profile-nav__badge">{favorites.length}</span>
              )}
            </Link>
          </nav>

          <button className="profile-logout" onClick={onLogout}>Выйти из аккаунта</button>
        </aside>

        {/* Правая часть */}
        <div className="profile-content">

          {/* ── Заказы ── */}
          {tab === 'orders' && (
            <div>
              <h1 className="profile-content__title">Мои заказы</h1>
              {ordersLoading ? (
                <p style={{ color: 'var(--color-text-muted)' }}>Загружаем заказы...</p>
              ) : orders.length === 0 ? (
                <div className="profile-empty">
                  <p>У вас пока нет заказов</p>
                  <Link to="/catalog" className="btn btn-primary">Перейти в каталог</Link>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-card__header">
                        <div>
                          <span className="order-card__id">Заказ #{order.id}</span>
                          <span className="order-card__date">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
                              : '—'}
                          </span>
                        </div>
                        <span className="order-card__status" style={{ color: STATUS_COLOR[order.status] }}>
                          {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                      </div>

                      {order.items?.length > 0 && (
                        <div className="order-card__items">
                          {order.items.map((item, i) => (
                            <div key={i} className="order-card__item">
                              <span className="order-card__item-name">{item.productName}</span>
                              <span className="order-card__item-qty">{item.quantity} шт.</span>
                              <span className="order-card__item-price">{item.price * item.quantity} ₽</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="order-card__footer">
                        <span className="order-card__total">Итого: {order.total} ₽</span>
                        <Link to="/catalog" className="btn btn-secondary order-card__repeat">
                          Повторить заказ
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Мои растения ── */}
          {tab === 'plants' && (
            <div>
              <h1 className="profile-content__title">Мои растения</h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                Растения из твоих заказов — с советами по уходу
              </p>
              {ordersLoading ? (
                <p style={{ color: 'var(--color-text-muted)' }}>Загружаем...</p>
              ) : myPlants.length === 0 ? (
                <div className="profile-empty">
                  <p>Здесь появятся растения после первого заказа</p>
                  <Link to="/catalog" className="btn btn-primary">В каталог</Link>
                </div>
              ) : (
                <div className="plants-list">
                  {myPlants.map((plant) => (
                    <div key={plant.id} className="plant-card">
                      <div className="plant-card__header">
                        <div>
                          <h3 className="plant-card__name">{plant.name}</h3>
                          <span className="plant-card__date">куплено {plant.purchasedAt}</span>
                        </div>
                        <span className="plant-card__care">
                          {CARE_ICON[plant.care]} {plant.care}
                        </span>
                      </div>
                      <div className="plant-card__info">
                        <div className="plant-card__tip">
                          <span className="plant-card__tip-icon">☀️</span>
                          <div>
                            <span className="plant-card__tip-label">Свет</span>
                            <span className="plant-card__tip-value">{plant.light}</span>
                          </div>
                        </div>
                        <div className="plant-card__tip">
                          <span className="plant-card__tip-icon">💧</span>
                          <div>
                            <span className="plant-card__tip-label">Полив</span>
                            <span className="plant-card__tip-value">{plant.watering}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Личные данные ── */}
          {tab === 'data' && (
            <div>
              <div className="profile-content__header">
                <h1 className="profile-content__title">Личные данные</h1>
                {!editing && (
                  <button
                    className="btn btn-secondary profile-edit-btn"
                    onClick={() => { setDraft(profile); setEditing(true) }}
                  >
                    Редактировать
                  </button>
                )}
              </div>

              {!editing ? (
                <div className="profile-info">
                  {[
                    ['Имя',           profile.firstName],
                    ['Фамилия',       profile.lastName],
                    ['Email',         profile.email],
                    ['Телефон',       profile.phone],
                    ['Дата рождения', profile.birthDate],
                  ].map(([label, value]) => (
                    <div key={label} className="profile-info__row">
                      <span className="profile-info__label">{label}</span>
                      <span className="profile-info__value">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <form className="profile-form" onSubmit={handleSave}>
                  <div className="profile-form__row">
                    <div className="profile-form__field">
                      <label className="profile-form__label">Имя</label>
                      <input className="profile-form__input" value={draft.firstName} onChange={set('firstName')} />
                    </div>
                    <div className="profile-form__field">
                      <label className="profile-form__label">Фамилия</label>
                      <input className="profile-form__input" value={draft.lastName} onChange={set('lastName')} />
                    </div>
                  </div>
                  <div className="profile-form__row">
                    <div className="profile-form__field">
                      <label className="profile-form__label">Email</label>
                      <input type="email" className="profile-form__input" value={draft.email} onChange={set('email')} />
                    </div>
                    <div className="profile-form__field">
                      <label className="profile-form__label">Телефон</label>
                      <input type="tel" className="profile-form__input" value={draft.phone} onChange={set('phone')} />
                    </div>
                  </div>
                  <div className="profile-form__field">
                    <label className="profile-form__label">Дата рождения</label>
                    <input type="date" className="profile-form__input profile-form__input--half" value={draft.birthDate} onChange={set('birthDate')} />
                  </div>
                  <div className="profile-form__actions">
                    <button type="submit" className="btn btn-primary">Сохранить</button>
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>Отмена</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
