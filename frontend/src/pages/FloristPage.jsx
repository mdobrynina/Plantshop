import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../api/api'
import './FloristPage.css'

const ALL_STATUSES = [
  { value: 'NEW',        label: 'Новый',          color: '#2196f3' },
  { value: 'PROCESSING', label: 'В обработке',    color: '#ff9800' },
  { value: 'READY',      label: 'Готов к выдаче', color: '#009688', onlyPickup: true },
  { value: 'SHIPPED',    label: 'В доставке',     color: '#9c27b0', onlyCourier: true },
  { value: 'DELIVERED',  label: 'Доставлен',      color: '#4caf50' },
  { value: 'CANCELLED',  label: 'Отменён',        color: '#e05a5a' },
]

function statusesForOrder(order) {
  return ALL_STATUSES.filter(s => {
    if (s.onlyPickup  && order.deliveryType !== 'pickup') return false
    if (s.onlyCourier && order.deliveryType === 'pickup') return false
    return true
  })
}

const TABS = [['orders', 'Заказы'], ['stock', 'Склад'], ['notes', 'Заметки']]

const CATEGORIES = ['Алоказии','Аглонемы','Антуриумы','Бегонии','Калатеи','Маранты','Монстеры','Орхидеи','Папоротники','Пеперомии','Сансевиерии','Суккуленты','Филодендроны','Фикусы','Разные']

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function FloristPage({ user }) {
  const [tab,        setTab]       = useState('orders')
  const [orders,     setOrders]    = useState([])
  const [stock,      setStock]     = useState([])
  const [notes,      setNotes]     = useState({})
  const [expanded,   setExpanded]  = useState(null)
  const [editNote,   setEditNote]  = useState(null)
  const [noteText,   setNoteText]  = useState('')
  const [loading,    setLoading]   = useState(true)
  const [stockSearch, setStockSearch] = useState('')
  const [stockSort,   setStockSort]   = useState('name')
  const [showAddProd, setShowAddProd] = useState(false)
  const [newProd,     setNewProd]     = useState({ name: '', categoryName: '', price: '', stock: '10', care: 'средне', light: '', watering: '', description: '' })

  useEffect(() => {
    if (!user || (user.role !== 'FLORIST' && user.role !== 'ADMIN')) return
    Promise.all([
      api.get('/florist/orders'),
      api.get('/florist/products'),
    ]).then(([ord, prod]) => {
      setOrders(ord)
      setStock(prod.map(p => ({
        ...p,
        qty: p.stock ?? (p.inStock ? 10 : 0),
        low: (p.stock ?? 10) <= 4,
      })))
    }).catch(console.error).finally(() => setLoading(false))
  }, [user])

  if (!user || (user.role !== 'FLORIST' && user.role !== 'ADMIN')) {
    return <Navigate to="/" replace />
  }

  const newCount        = orders.filter(o => o.status === 'NEW').length
  const readyCount      = orders.filter(o => o.status === 'READY').length
  const lowCount        = stock.filter(s => s.low).length
  const ordersWithNotes = orders.filter(o => notes[o.id])

  const changeStatus = (id, status) => {
    api.put(`/florist/orders/${id}/status?status=${status}`)
      .then(() => setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o)))
      .catch(console.error)
  }

  const saveNote = (id) => {
    setNotes(prev => ({ ...prev, [id]: noteText }))
    setEditNote(null)
  }

  const changeQty = (id, delta) =>
    setStock(prev => prev.map(s => {
      if (s.id !== id) return s
      const qty = Math.max(0, s.qty + delta)
      const low = qty <= 4
      api.put(`/florist/products/${id}/stock?qty=${qty}`).catch(console.error)
      return { ...s, qty, low, inStock: qty > 0 }
    }))

  const addProduct = () => {
    if (!newProd.name || !newProd.price) return
    const body = {
      name: newProd.name,
      categoryName: newProd.categoryName || 'Разные',
      category: (newProd.categoryName || 'разные').toLowerCase().replace(/\s+/g, '_'),
      price: Number(newProd.price),
      stock: Number(newProd.stock) || 10,
      care: newProd.care,
      light: newProd.light,
      watering: newProd.watering,
      description: newProd.description,
    }
    api.post('/florist/products', body)
      .then(created => {
        setStock(prev => [...prev, { ...created, qty: created.stock ?? 10, low: (created.stock ?? 10) <= 4 }])
        setNewProd({ name: '', categoryName: '', price: '', stock: '10', care: 'средне', light: '', watering: '', description: '' })
        setShowAddProd(false)
      })
      .catch(console.error)
  }

  const visibleStock = stock
    .filter(s => s.name.toLowerCase().includes(stockSearch.toLowerCase()))
    .sort((a, b) => {
      if (stockSort === 'qty-asc')  return a.qty - b.qty
      if (stockSort === 'qty-desc') return b.qty - a.qty
      return a.name.localeCompare(b.name, 'ru')
    })

  if (loading) return <div className="florist-page"><div className="container">Загрузка...</div></div>

  return (
    <div className="florist-page">
      <div className="container">

        {/* Сводка дня */}
        <div className="florist-summary">
          {[
            { num: newCount,      label: 'Новых заказов',   mod: newCount > 0   ? 'alert' : '' },
            { num: orders.length, label: 'Всего активных',  mod: '' },
            { num: readyCount,    label: 'Готовы к выдаче', mod: readyCount > 0 ? 'ready' : '' },
            { num: lowCount,      label: 'Мало на складе',  mod: lowCount > 0   ? 'low'   : '' },
          ].map(s => (
            <div key={s.label} className={`florist-summary__item ${s.mod ? 'florist-summary__item--' + s.mod : ''}`}>
              <span className="florist-summary__num">{s.num}</span>
              <span className="florist-summary__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Табы */}
        <div className="admin-tabs">
          {TABS.map(([key, label]) => (
            <button key={key}
              className={`admin-tab ${tab === key ? 'admin-tab--active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
              {key === 'orders' && newCount > 0             && <span className="florist-tab-badge">{newCount}</span>}
              {key === 'notes'  && ordersWithNotes.length > 0 && <span className="florist-tab-badge">{ordersWithNotes.length}</span>}
            </button>
          ))}
        </div>

        {/* ── Заказы ── */}
        {tab === 'orders' && (
          <div className="florist-orders">
            {orders.length === 0
              ? <p style={{ color: 'var(--color-text-muted)' }}>Заказов пока нет</p>
              : orders.map(order => {
                const availStatuses = statusesForOrder(order)
                const st = ALL_STATUSES.find(s => s.value === order.status)
                const note = notes[order.id] || ''
                return (
                  <div key={order.id} className="florist-order">
                    <div className="florist-order__head" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                      <div className="florist-order__meta">
                        <span className="florist-order__id">Заказ #{order.id}</span>
                        <span className="florist-order__date">{fmtDate(order.createdAt)}</span>
                        <span className="florist-order__client">{order.clientName || `Клиент #${order.userId}`}</span>
                        {note && <span title={note}>📝</span>}
                      </div>
                      <div className="florist-order__right">
                        <select
                          className="florist-status-select"
                          value={order.status}
                          style={{ color: st?.color }}
                          onChange={e => { e.stopPropagation(); changeStatus(order.id, e.target.value) }}
                          onClick={e => e.stopPropagation()}
                        >
                          {availStatuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                        <span className="florist-order__total">{Number(order.total).toLocaleString('ru')} ₽</span>
                        <span className="florist-order__arrow">{expanded === order.id ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {expanded === order.id && (
                      <div className="florist-order__body">
                        <div className="florist-order__contact">
                          {order.phone    && <span>📞 {order.phone}</span>}
                          {order.address  && <span>📍 {order.address}</span>}
                          {order.deliveryType && <span>🚚 {order.deliveryType === 'courier' ? 'Курьер' : order.deliveryType === 'pickup' ? 'Самовывоз' : 'Почта'}</span>}
                        </div>
                        <div className="florist-order__items">
                          {(order.items || []).map((item, i) => (
                            <div key={i} className="florist-order__item">
                              <span className="florist-order__item-name">{item.product?.name || 'Товар'}</span>
                              <span className="florist-order__item-qty">{item.quantity} шт.</span>
                              <span className="florist-order__item-price">{Number(item.price) * item.quantity} ₽</span>
                            </div>
                          ))}
                        </div>
                        {order.comment && (
                          <div className="florist-order__note">💬 {order.comment}</div>
                        )}
                        {note && (
                          <div className="florist-order__note">📝 {note}</div>
                        )}
                        <button className="florist-note-btn"
                          onClick={() => { setEditNote(order.id); setNoteText(note); setTab('notes') }}>
                          {note ? 'Редактировать заметку' : '+ Добавить заметку'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            }
          </div>
        )}

        {/* ── Склад ── */}
        {tab === 'stock' && (
          <div>
            <div className="florist-stock-toolbar">
              <input
                className="florist-stock-search"
                placeholder="Поиск по названию…"
                value={stockSearch}
                onChange={e => setStockSearch(e.target.value)}
              />
              <select className="florist-stock-sort" value={stockSort} onChange={e => setStockSort(e.target.value)}>
                <option value="name">По названию</option>
                <option value="qty-asc">Сначала мало</option>
                <option value="qty-desc">Сначала много</option>
              </select>
              <button className="btn btn-primary florist-stock-add-btn" onClick={() => setShowAddProd(v => !v)}>
                + Добавить товар
              </button>
            </div>

            {showAddProd && (
              <div className="florist-add-product-form">
                <input className="admin-form__input" placeholder="Название *" value={newProd.name}
                  onChange={e => setNewProd(p => ({ ...p, name: e.target.value }))} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <select className="admin-form__input" value={newProd.categoryName}
                    onChange={e => setNewProd(p => ({ ...p, categoryName: e.target.value }))}>
                    <option value="">— Категория —</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select className="admin-form__input" value={newProd.care}
                    onChange={e => setNewProd(p => ({ ...p, care: e.target.value }))}>
                    <option value="легко">Уход: легко</option>
                    <option value="средне">Уход: средне</option>
                    <option value="сложно">Уход: сложно</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input className="admin-form__input" placeholder="Цена, ₽ *" type="number" value={newProd.price}
                    onChange={e => setNewProd(p => ({ ...p, price: e.target.value }))} />
                  <input className="admin-form__input" placeholder="Количество, шт." type="number" value={newProd.stock}
                    onChange={e => setNewProd(p => ({ ...p, stock: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input className="admin-form__input" placeholder="Освещение" value={newProd.light}
                    onChange={e => setNewProd(p => ({ ...p, light: e.target.value }))} />
                  <input className="admin-form__input" placeholder="Полив" value={newProd.watering}
                    onChange={e => setNewProd(p => ({ ...p, watering: e.target.value }))} />
                </div>
                <textarea className="admin-form__input" placeholder="Краткое описание" rows={2}
                  style={{ height: 'auto', padding: '10px 12px', resize: 'vertical' }}
                  value={newProd.description}
                  onChange={e => setNewProd(p => ({ ...p, description: e.target.value }))} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary" onClick={addProduct}>Сохранить</button>
                  <button className="btn btn-secondary" onClick={() => setShowAddProd(false)}>Отмена</button>
                </div>
              </div>
            )}

            <p className="florist-hint">
              {visibleStock.length} из {stock.length} позиций. Позиции с ≤ 4 шт. подсвечиваются красным.
            </p>
            <div className="florist-stock-grid">
              {visibleStock.map(s => (
                <div key={s.id} className={`florist-stock-card ${s.low ? 'florist-stock-card--low' : ''}`}>
                  <span className="florist-stock-card__name">{s.name}</span>
                  <div className="florist-stock-card__controls">
                    <button className="florist-qty-btn" onClick={() => changeQty(s.id, -1)}>−</button>
                    <span className={`florist-stock-card__qty ${s.qty === 0 ? 'florist-stock-card__qty--zero' : ''}`}>
                      {s.qty} шт.
                    </span>
                    <button className="florist-qty-btn" onClick={() => changeQty(s.id, 1)}>+</button>
                  </div>
                  {s.low && (
                    <span className="florist-stock-card__alert">
                      {s.qty === 0 ? '❌ Нет' : '⚠️ Мало!'}
                    </span>
                  )}
                </div>
              ))}
              {visibleStock.length === 0 && (
                <p style={{ color: 'var(--color-text-muted)' }}>Ничего не найдено</p>
              )}
            </div>
          </div>
        )}

        {/* ── Заметки ── */}
        {tab === 'notes' && (
          <div>
            <p className="florist-hint">Заметки видишь только ты и администратор.</p>
            <div className="florist-notes">
              {orders.map(order => {
                const note = notes[order.id] || ''
                return (
                  <div key={order.id} className="florist-note-card">
                    <div className="florist-note-card__header">
                      <span className="florist-note-card__id">Заказ #{order.id}</span>
                      <span className="florist-note-card__client">{order.clientName || `Клиент #${order.userId}`}</span>
                      <span className="florist-note-card__date">{fmtDate(order.createdAt)}</span>
                    </div>

                    {editNote === order.id ? (
                      <div className="florist-note-edit">
                        <textarea
                          className="florist-note-edit__textarea"
                          value={noteText}
                          onChange={e => setNoteText(e.target.value)}
                          placeholder="Введи заметку к заказу..."
                          rows={3}
                          autoFocus
                        />
                        <div className="florist-note-edit__actions">
                          <button className="btn btn-primary"   onClick={() => saveNote(order.id)}>Сохранить</button>
                          <button className="btn btn-secondary" onClick={() => setEditNote(null)}>Отмена</button>
                        </div>
                      </div>
                    ) : (
                      <div className="florist-note-card__body">
                        {note
                          ? <p className="florist-note-card__text">{note}</p>
                          : <p className="florist-note-card__empty">Нет заметки</p>
                        }
                        <button className="florist-note-btn"
                          onClick={() => { setEditNote(order.id); setNoteText(note) }}>
                          {note ? '✎ Изменить' : '+ Добавить'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
