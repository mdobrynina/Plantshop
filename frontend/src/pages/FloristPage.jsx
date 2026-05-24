import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import './FloristPage.css'

const STATUSES = [
  { value: 'new',        label: 'Новый' },
  { value: 'processing', label: 'В обработке' },
  { value: 'ready',      label: 'Готов к выдаче' },
  { value: 'shipped',    label: 'В доставке' },
  { value: 'delivered',  label: 'Доставлен' },
]

const STATUS_COLOR = {
  new:        '#2196f3',
  processing: '#ff9800',
  ready:      '#009688',
  shipped:    '#9c27b0',
  delivered:  '#4caf50',
}

const INITIAL_ORDERS = [
  {
    id: 2, date: '21.05.2026', status: 'processing',
    client: 'Марина Иванова', phone: '+7 (900) 123-45-67',
    address: 'ул. Ленина 12, кв. 34',
    items: [{ name: 'Суккуленты микс', qty: 2, price: 890 }],
    total: 1780,
  },
  {
    id: 3, date: '22.05.2026', status: 'new',
    client: 'Анна Смирнова', phone: '+7 (916) 234-56-78',
    address: 'пр. Мира 5, кв. 101',
    items: [{ name: 'Аглонема Сиам Аврора', qty: 1, price: 990 }],
    total: 990,
  },
  {
    id: 4, date: '23.05.2026', status: 'ready',
    client: 'Дмитрий Козлов', phone: '+7 (903) 345-67-89',
    address: 'ул. Садовая 78, кв. 12',
    items: [
      { name: 'Монстера деликатесная', qty: 2, price: 1290 },
      { name: 'Антуриум Андре',        qty: 1, price: 1150 },
    ],
    total: 3730,
  },
]

export default function FloristPage({ user }) {
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [expanded, setExpanded] = useState(null)

  if (!user || (user.role !== 'FLORIST' && user.role !== 'ADMIN')) {
    return <Navigate to="/" replace />
  }

  const changeStatus = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
  }

  return (
    <div className="florist-page">
      <div className="container">
        <div className="florist-header">
          <div>
            <h1 className="florist-header__title">Рабочий стол флориста</h1>
            <p className="florist-header__sub">Обработка заказов и управление наличием</p>
          </div>
          <span className="florist-header__badge">FLORIST</span>
        </div>

        <div className="florist-orders">
          {orders.map(order => (
            <div key={order.id} className="florist-order">
              <div
                className="florist-order__head"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="florist-order__meta">
                  <span className="florist-order__id">Заказ #{order.id}</span>
                  <span className="florist-order__date">{order.date}</span>
                  <span className="florist-order__client">{order.client}</span>
                </div>

                <div className="florist-order__right">
                  <select
                    className="florist-status-select"
                    value={order.status}
                    style={{ color: STATUS_COLOR[order.status] }}
                    onChange={(e) => { e.stopPropagation(); changeStatus(order.id, e.target.value) }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <span className="florist-order__total">{order.total.toLocaleString('ru')} ₽</span>
                  <span className="florist-order__arrow">{expanded === order.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === order.id && (
                <div className="florist-order__body">
                  <div className="florist-order__contact">
                    <span>📞 {order.phone}</span>
                    <span>📍 {order.address}</span>
                  </div>
                  <div className="florist-order__items">
                    {order.items.map((item, i) => (
                      <div key={i} className="florist-order__item">
                        <span className="florist-order__item-name">{item.name}</span>
                        <span className="florist-order__item-qty">{item.qty} шт.</span>
                        <span className="florist-order__item-price">{item.price * item.qty} ₽</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
