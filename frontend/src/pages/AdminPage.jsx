import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import './AdminPage.css'

const MOCK_USERS = [
  { id: 1, fullName: 'Алексей Соколов',  email: 'admin@moh.ru',   role: 'ADMIN' },
  { id: 2, fullName: 'Марина Иванова',   email: 'client@moh.ru',  role: 'CLIENT' },
  { id: 3, fullName: 'Светлана Петрова', email: 'florist@moh.ru', role: 'FLORIST' },
]

const MOCK_ORDERS = [
  { id: 1, user: 'Марина Иванова',   total: 2780, status: 'delivered',  statusLabel: 'Доставлен',   date: '18.05.2026' },
  { id: 2, user: 'Марина Иванова',   total: 1780, status: 'processing', statusLabel: 'В обработке', date: '21.05.2026' },
  { id: 3, user: 'Анна Смирнова',    total: 990,  status: 'new',        statusLabel: 'Новый',       date: '22.05.2026' },
  { id: 4, user: 'Дмитрий Козлов',   total: 4230, status: 'shipped',    statusLabel: 'В доставке',  date: '23.05.2026' },
]

// Данные по товарам: продажи за последние 30 дней + остатки
const PRODUCT_ANALYTICS = [
  { id: 1, name: 'Монстера деликатесная', sold: 24, stock: 2,  price: 1290 },
  { id: 2, name: 'Суккуленты микс',       sold: 31, stock: 18, price: 890  },
  { id: 3, name: 'Суккулент эхеверия',    sold: 19, stock: 11, price: 790  },
  { id: 4, name: 'Алоказия амазонская',   sold: 8,  stock: 7,  price: 1490 },
  { id: 5, name: 'Аглонема Сиам Аврора',  sold: 15, stock: 9,  price: 990  },
  { id: 6, name: 'Антуриум Андре',        sold: 5,  stock: 14, price: 1150 },
  { id: 7, name: 'Орхидея Фаленопсис',    sold: 3,  stock: 8,  price: 1390 },
  { id: 8, name: 'Нефролепис возвышенный',sold: 11, stock: 5,  price: 750  },
]

// График: выручка по дням за последние 7 дней
const CHART_DATA = [
  { day: 'Пн', revenue: 3200 },
  { day: 'Вт', revenue: 5800 },
  { day: 'Ср', revenue: 2100 },
  { day: 'Чт', revenue: 7400 },
  { day: 'Пт', revenue: 9100 },
  { day: 'Сб', revenue: 12300 },
  { day: 'Вс', revenue: 8600 },
]

const STATUS_COLOR = {
  new:        '#2196f3',
  processing: '#ff9800',
  shipped:    '#9c27b0',
  delivered:  '#4caf50',
  cancelled:  '#e05a5a',
}

const ROLE_LABEL = { ADMIN: 'Администратор', CLIENT: 'Клиент', FLORIST: 'Флорист' }

const maxRevenue = Math.max(...CHART_DATA.map(d => d.revenue))

const sorted     = [...PRODUCT_ANALYTICS].sort((a, b) => b.sold - a.sold)
const topSellers = sorted.slice(0, 3)
const lowSellers = [...sorted].reverse().slice(0, 3)
const lowStock   = PRODUCT_ANALYTICS.filter(p => p.stock <= 5)

const avgCheck = Math.round(
  MOCK_ORDERS.reduce((s, o) => s + o.total, 0) / MOCK_ORDERS.length
)

export default function AdminPage({ user }) {
  const [tab, setTab] = useState('analytics')

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1 className="admin-header__title">Панель администратора</h1>
          <span className="admin-header__badge">ADMIN</span>
        </div>

        {/* Верхняя статистика */}
        <div className="admin-stats">
          <div className="admin-stat">
            <span className="admin-stat__value">{MOCK_ORDERS.length}</span>
            <span className="admin-stat__label">Заказов за неделю</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat__value">
              {MOCK_ORDERS.reduce((s, o) => s + o.total, 0).toLocaleString('ru')} ₽
            </span>
            <span className="admin-stat__label">Выручка за неделю</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat__value">{avgCheck.toLocaleString('ru')} ₽</span>
            <span className="admin-stat__label">Средний чек</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat__value">{MOCK_USERS.length}</span>
            <span className="admin-stat__label">Пользователей</span>
          </div>
        </div>

        {/* Табы */}
        <div className="admin-tabs">
          {[
            ['analytics', '📊 Аналитика'],
            ['orders',    '📦 Заказы'],
            ['users',     '👥 Пользователи'],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`admin-tab ${tab === key ? 'admin-tab--active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ───── АНАЛИТИКА ───── */}
        {tab === 'analytics' && (
          <div className="analytics">

            {/* График выручки */}
            <div className="analytics-card">
              <h3 className="analytics-card__title">Выручка по дням (последние 7 дней)</h3>
              <div className="chart">
                {CHART_DATA.map(d => (
                  <div key={d.day} className="chart__col">
                    <span className="chart__value">{(d.revenue / 1000).toFixed(1)}к</span>
                    <div className="chart__bar-wrap">
                      <div
                        className="chart__bar"
                        style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="chart__label">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-grid">
              {/* Хиты продаж */}
              <div className="analytics-card">
                <h3 className="analytics-card__title">🔥 Хиты продаж</h3>
                <p className="analytics-card__sub">Продавать больше, держать запас</p>
                {topSellers.map((p, i) => (
                  <div key={p.id} className="analytics-product">
                    <span className="analytics-product__rank">#{i + 1}</span>
                    <span className="analytics-product__name">{p.name}</span>
                    <span className="analytics-product__sold">{p.sold} шт.</span>
                    <span className="analytics-tag analytics-tag--green">Хит</span>
                  </div>
                ))}
              </div>

              {/* Низкий спрос */}
              <div className="analytics-card">
                <h3 className="analytics-card__title">🟡 Низкий спрос</h3>
                <p className="analytics-card__sub">Заказывать меньше, снизить запас</p>
                {lowSellers.map((p, i) => (
                  <div key={p.id} className="analytics-product">
                    <span className="analytics-product__rank">#{i + 1}</span>
                    <span className="analytics-product__name">{p.name}</span>
                    <span className="analytics-product__sold">{p.sold} шт.</span>
                    <span className="analytics-tag analytics-tag--yellow">Меньше</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Рекомендации */}
            <div className="analytics-card">
              <h3 className="analytics-card__title">💡 Рекомендации по закупке</h3>
              <div className="recommendations">
                {lowStock.map(p => (
                  <div key={p.id} className="recommendation recommendation--red">
                    <span className="recommendation__icon">🔴</span>
                    <span className="recommendation__text">
                      <strong>{p.name}</strong> — осталось {p.stock} шт., срочно дозаказать
                    </span>
                  </div>
                ))}
                {topSellers.map(p => (
                  <div key={p.id} className="recommendation recommendation--green">
                    <span className="recommendation__icon">🟢</span>
                    <span className="recommendation__text">
                      <strong>{p.name}</strong> — продаётся хорошо ({p.sold} шт./мес.), держать запас
                    </span>
                  </div>
                ))}
                {lowSellers.map(p => (
                  <div key={p.id} className="recommendation recommendation--yellow">
                    <span className="recommendation__icon">🟡</span>
                    <span className="recommendation__text">
                      <strong>{p.name}</strong> — низкий спрос ({p.sold} шт./мес.), уменьшить закупку
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Таблица всех товаров */}
            <div className="analytics-card">
              <h3 className="analytics-card__title">📋 Все товары</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th>Цена</th>
                      <th>Продано за месяц</th>
                      <th>Остаток</th>
                      <th>Выручка</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...PRODUCT_ANALYTICS]
                      .sort((a, b) => b.sold - a.sold)
                      .map(p => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{p.price.toLocaleString('ru')} ₽</td>
                          <td>{p.sold} шт.</td>
                          <td>
                            <span style={{ color: p.stock <= 5 ? '#e05a5a' : 'inherit', fontWeight: p.stock <= 5 ? 700 : 400 }}>
                              {p.stock} шт. {p.stock <= 5 ? '⚠️' : ''}
                            </span>
                          </td>
                          <td>{(p.sold * p.price).toLocaleString('ru')} ₽</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ───── ЗАКАЗЫ ───── */}
        {tab === 'orders' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th><th>Клиент</th><th>Дата</th><th>Сумма</th><th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ORDERS.map(o => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.user}</td>
                    <td>{o.date}</td>
                    <td>{o.total.toLocaleString('ru')} ₽</td>
                    <td>
                      <span className="admin-status" style={{ color: STATUS_COLOR[o.status] }}>
                        {o.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ───── ПОЛЬЗОВАТЕЛИ ───── */}
        {tab === 'users' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>#</th><th>Имя</th><th>Email</th><th>Роль</th></tr>
              </thead>
              <tbody>
                {MOCK_USERS.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`admin-role admin-role--${u.role.toLowerCase()}`}>
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
