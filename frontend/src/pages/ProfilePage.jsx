import { useState } from 'react'
import { Link } from 'react-router-dom'
import './ProfilePage.css'

const MOCK_ORDERS = [
  {
    id: '2026-001',
    date: '18 мая 2026',
    status: 'delivered',
    statusLabel: 'Доставлен',
    items: [
      { name: 'Монстера деликатесная', qty: 1, price: 1290 },
      { name: 'Алоказия амазонская',   qty: 1, price: 1490 },
    ],
    total: 2780,
  },
  {
    id: '2026-002',
    date: '21 мая 2026',
    status: 'processing',
    statusLabel: 'В обработке',
    items: [
      { name: 'Суккуленты микс', qty: 2, price: 890 },
    ],
    total: 1780,
  },
]

const STATUS_COLOR = {
  delivered:  '#4caf50',
  processing: '#ff9800',
  cancelled:  '#e05a5a',
}

export default function ProfilePage({ favorites }) {
  const [tab, setTab] = useState('orders')
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({
    firstName: 'Марина',
    lastName:  'Добрынина',
    email:     'marina@example.com',
    phone:     '+7 (900) 123-45-67',
    birthDate: '2005-09-15',
  })
  const [draft, setDraft] = useState(profile)

  const set = (field) => (e) =>
    setDraft((p) => ({ ...p, [field]: e.target.value }))

  const handleSave = (e) => {
    e.preventDefault()
    setProfile(draft)
    setEditing(false)
  }

  const handleCancel = () => {
    setDraft(profile)
    setEditing(false)
  }

  return (
    <div className="profile-page">
      <div className="container profile-layout">

        {/* Левая панель */}
        <aside className="profile-sidebar">
          <div className="profile-avatar">
            {profile.firstName[0]}{profile.lastName[0]}
          </div>
          <p className="profile-sidebar__name">
            {profile.firstName} {profile.lastName}
          </p>
          <p className="profile-sidebar__email">{profile.email}</p>

          <nav className="profile-nav">
            <button
              className={`profile-nav__item ${tab === 'orders' ? 'profile-nav__item--active' : ''}`}
              onClick={() => setTab('orders')}
            >
              📦 Мои заказы
            </button>
            <button
              className={`profile-nav__item ${tab === 'data' ? 'profile-nav__item--active' : ''}`}
              onClick={() => setTab('data')}
            >
              👤 Личные данные
            </button>
            <Link to="/favorites" className="profile-nav__item">
              ♥ Избранное
              {favorites?.length > 0 && (
                <span className="profile-nav__badge">{favorites.length}</span>
              )}
            </Link>
          </nav>

          <button className="profile-logout">Выйти из аккаунта</button>
        </aside>

        {/* Правая часть */}
        <div className="profile-content">

          {/* Заказы */}
          {tab === 'orders' && (
            <div>
              <h1 className="profile-content__title">Мои заказы</h1>
              {MOCK_ORDERS.length === 0 ? (
                <div className="profile-empty">
                  <p>У вас пока нет заказов</p>
                  <Link to="/catalog" className="btn btn-primary">Перейти в каталог</Link>
                </div>
              ) : (
                <div className="orders-list">
                  {MOCK_ORDERS.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-card__header">
                        <div>
                          <span className="order-card__id">Заказ #{order.id}</span>
                          <span className="order-card__date">{order.date}</span>
                        </div>
                        <span
                          className="order-card__status"
                          style={{ color: STATUS_COLOR[order.status] }}
                        >
                          {order.statusLabel}
                        </span>
                      </div>

                      <div className="order-card__items">
                        {order.items.map((item, i) => (
                          <div key={i} className="order-card__item">
                            <span className="order-card__item-name">{item.name}</span>
                            <span className="order-card__item-qty">{item.qty} шт.</span>
                            <span className="order-card__item-price">{item.price * item.qty} ₽</span>
                          </div>
                        ))}
                      </div>

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

          {/* Личные данные */}
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
                    ['Имя',          profile.firstName],
                    ['Фамилия',      profile.lastName],
                    ['Email',        profile.email],
                    ['Телефон',      profile.phone],
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
