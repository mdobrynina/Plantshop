import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../api/api'
import './AdminPage.css'

const STATUSES = [
  { value: 'NEW',        label: 'Новый',       color: '#2196f3' },
  { value: 'PROCESSING', label: 'В обработке', color: '#ff9800' },
  { value: 'SHIPPED',    label: 'В доставке',  color: '#9c27b0' },
  { value: 'DELIVERED',  label: 'Доставлен',   color: '#4caf50' },
  { value: 'CANCELLED',  label: 'Отменён',     color: '#e05a5a' },
]

const ROLES      = ['ADMIN', 'FLORIST', 'CLIENT']
const ROLE_LABEL = { ADMIN: 'Администратор', CLIENT: 'Клиент', FLORIST: 'Флорист' }
const TABS       = [['analytics','Аналитика'], ['orders','Заказы'], ['products','Товары'], ['staff','Сотрудники']]

const CHART_DATA = [
  { label: 'Пн', value: 4200 }, { label: 'Вт', value: 3800 },
  { label: 'Ср', value: 6100 }, { label: 'Чт', value: 5400 },
  { label: 'Пт', value: 7200 }, { label: 'Сб', value: 9800 },
  { label: 'Вс', value: 8100 },
]
const maxVal = Math.max(...CHART_DATA.map(d => d.value))

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtItems(items = []) {
  return items.map(it => `${it.product?.name ?? 'Товар'} ×${it.quantity}`)
}

export default function AdminPage({ user }) {
  const [tab,      setTab]      = useState('analytics')
  const [orders,   setOrders]   = useState([])
  const [products, setProducts] = useState([])
  const [staff,    setStaff]    = useState([])
  const [loading,  setLoading]  = useState(true)

  const [editPrice,      setEditPrice]      = useState({})
  const [newProduct,     setNewProduct]     = useState({ name: '', categoryName: '', price: '', stock: '10', description: '', care: 'легко', light: '', watering: '' })
  const [newStaff,       setNewStaff]       = useState({ firstName: '', lastName: '', email: '', password: '', role: 'FLORIST' })
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddStaff,   setShowAddStaff]   = useState(false)
  const [imageFile,      setImageFile]      = useState(null)
  const [imagePreview,   setImagePreview]   = useState('')

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return
    Promise.all([
      api.get('/admin/orders'),
      api.get('/products'),
      api.get('/admin/users'),
    ]).then(([ord, prod, usr]) => {
      setOrders(ord)
      setProducts(prod)
      setStaff(usr)
    }).catch(console.error).finally(() => setLoading(false))
  }, [user])

  if (!user || user.role !== 'ADMIN') return <Navigate to="/" replace />

  const totalRevenue = orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + Number(o.total), 0)
  const avgCheck     = orders.length ? Math.round(orders.reduce((s, o) => s + Number(o.total), 0) / orders.length) : 0

  // ── Заказы ──────────────────────────────────────────────────────────────

  const changeOrderStatus = (id, status) => {
    api.put(`/admin/orders/${id}/status?status=${status}`)
      .then(() => setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o)))
      .catch(console.error)
  }

  // ── Товары ──────────────────────────────────────────────────────────────

  const toggleStock = (p) => {
    api.put(`/admin/products/${p.id}`, { ...p, inStock: !p.inStock })
      .then(updated => setProducts(prev => prev.map(x => x.id === p.id ? updated : x)))
      .catch(console.error)
  }

  const deleteProduct = (id) => {
    api.delete(`/admin/products/${id}`)
      .then(() => setProducts(prev => prev.filter(p => p.id !== id)))
      .catch(console.error)
  }

  const savePrice = (p) => {
    const val = Number(editPrice[p.id])
    if (val > 0) {
      api.put(`/admin/products/${p.id}`, { ...p, price: val })
        .then(updated => setProducts(prev => prev.map(x => x.id === p.id ? updated : x)))
        .catch(console.error)
    }
    setEditPrice(prev => { const n = { ...prev }; delete n[p.id]; return n })
  }

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return
    let imageUrl = ''
    if (imageFile) {
      const fd = new FormData()
      fd.append('file', imageFile)
      try {
        const res = await api.upload('/admin/products/upload-image', fd)
        imageUrl = res?.url || ''
      } catch (e) { console.error(e) }
    }
    const body = {
      name: newProduct.name,
      categoryName: newProduct.categoryName || 'Без категории',
      category: (newProduct.categoryName || 'other').toLowerCase().replace(/\s+/g, '_'),
      price: Number(newProduct.price),
      stock: Number(newProduct.stock) || 10,
      inStock: (Number(newProduct.stock) || 10) > 0,
      description: newProduct.description,
      care: newProduct.care,
      light: newProduct.light,
      watering: newProduct.watering,
      image: imageUrl,
    }
    api.post('/admin/products', body)
      .then(created => {
        setProducts(prev => [...prev, created])
        setNewProduct({ name: '', categoryName: '', price: '', stock: '10', description: '', care: 'легко', light: '', watering: '' })
        setImageFile(null)
        setImagePreview('')
        setShowAddProduct(false)
      })
      .catch(console.error)
  }

  // ── Сотрудники ──────────────────────────────────────────────────────────

  const changeRole = (id, role) => {
    api.put(`/admin/users/${id}/role?role=${role}`)
      .then(updated => setStaff(prev => prev.map(s => s.id === id ? updated : s)))
      .catch(console.error)
  }

  const deleteStaff = (id) => {
    api.delete(`/admin/users/${id}`)
      .then(() => setStaff(prev => prev.filter(s => s.id !== id)))
      .catch(console.error)
  }

  const addStaff = () => {
    if (!newStaff.firstName || !newStaff.email || !newStaff.password) return
    api.post('/admin/users', newStaff)
      .then(created => {
        setStaff(prev => [...prev, created])
        setNewStaff({ firstName: '', lastName: '', email: '', password: '', role: 'FLORIST' })
        setShowAddStaff(false)
      })
      .catch(e => alert(e.message))
  }

  if (loading) return <div className="admin-page"><div className="container">Загрузка...</div></div>

  return (
    <div className="admin-page">
      <div className="container">

        <div className="admin-stats">
          {[
            { value: orders.length,                           label: 'Заказов'      },
            { value: totalRevenue.toLocaleString('ru') + ' ₽', label: 'Выручка'     },
            { value: avgCheck.toLocaleString('ru') + ' ₽',    label: 'Средний чек' },
            { value: products.length,                         label: 'Товаров'      },
          ].map(s => (
            <div key={s.label} className="admin-stat">
              <span className="admin-stat__value">{s.value}</span>
              <span className="admin-stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="admin-tabs">
          {TABS.map(([key, label]) => (
            <button key={key} className={`admin-tab ${tab === key ? 'admin-tab--active' : ''}`} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Аналитика ── */}
        {tab === 'analytics' && (
          <div className="analytics">
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3 className="analytics-card__title">Выручка за неделю</h3>
                <p className="analytics-card__sub">Пн — Вс, текущая неделя</p>
                <div className="chart">
                  {CHART_DATA.map(d => (
                    <div key={d.label} className="chart__col">
                      <span className="chart__value">{(d.value / 1000).toFixed(1)}к</span>
                      <div className="chart__bar-wrap">
                        <div className="chart__bar" style={{ height: `${(d.value / maxVal) * 100}%` }} />
                      </div>
                      <span className="chart__label">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analytics-card">
                <h3 className="analytics-card__title">Топ продаж</h3>
                <p className="analytics-card__sub">За последние 30 дней</p>
                {[
                  { name: 'Монстера деликатесная', sold: 24, tag: 'Хит',               tagClass: 'green'  },
                  { name: 'Суккуленты микс',       sold: 18, tag: 'Хит',               tagClass: 'green'  },
                  { name: 'Аглонема Сиам Аврора',  sold: 15, tag: null,                tagClass: null     },
                  { name: 'Орхидея Фаленопсис',    sold: 4,  tag: 'Меньше заказывать', tagClass: 'yellow' },
                ].map((p, i) => (
                  <div key={i} className="analytics-product">
                    <span className="analytics-product__rank">#{i + 1}</span>
                    <span className="analytics-product__name">{p.name}</span>
                    <span className="analytics-product__sold">{p.sold} шт.</span>
                    {p.tag && <span className={`analytics-tag analytics-tag--${p.tagClass}`}>{p.tag}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-card">
              <h3 className="analytics-card__title">Рекомендации</h3>
              <p className="analytics-card__sub">На основе продаж за последний месяц</p>
              <div className="recommendations">
                {[
                  { cls: 'red',    icon: '🔴', text: <><b>Орхидея Фаленопсис</b> — низкий спрос (4 шт.), уменьшить закупку</> },
                  { cls: 'green',  icon: '🟢', text: <><b>Монстера деликатесная</b> — продаётся хорошо (24 шт.), держать запас</> },
                  { cls: 'green',  icon: '🟢', text: <><b>Суккуленты микс</b> — стабильный спрос (18 шт.), увеличить закупку</> },
                  { cls: 'yellow', icon: '🟡', text: <><b>Алоказия амазонская</b> — средний спрос, следить за остатками</> },
                ].map((r, i) => (
                  <div key={i} className={`recommendation recommendation--${r.cls}`}>
                    <span>{r.icon}</span>
                    <span className="recommendation__text">{r.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Заказы ── */}
        {tab === 'orders' && (
          <div className="admin-table-wrap">
            {orders.length === 0
              ? <p style={{ color: 'var(--color-text-muted)' }}>Заказов пока нет</p>
              : (
                <table className="admin-table">
                  <thead><tr><th>#</th><th>Клиент</th><th>Телефон</th><th>Дата</th><th>Состав</th><th>Сумма</th><th>Статус</th></tr></thead>
                  <tbody>
                    {orders.map(o => {
                      const st = STATUSES.find(s => s.value === o.status)
                      return (
                        <tr key={o.id}>
                          <td>{o.id}</td>
                          <td>{o.clientName || `Клиент #${o.userId}`}</td>
                          <td className="td-muted">{o.phone || '—'}</td>
                          <td>{fmtDate(o.createdAt)}</td>
                          <td className="td-small">{fmtItems(o.items).join(', ') || '—'}</td>
                          <td>{Number(o.total).toLocaleString('ru')} ₽</td>
                          <td>
                            <select className="admin-status-select" value={o.status} style={{ color: st?.color }}
                              onChange={e => changeOrderStatus(o.id, e.target.value)}>
                              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )
            }
          </div>
        )}

        {/* ── Товары ── */}
        {tab === 'products' && (
          <div>
            <div className="admin-toolbar">
              <span className="admin-toolbar__count">{products.length} товаров</span>
              <button className="btn btn-primary" onClick={() => setShowAddProduct(v => !v)}>+ Добавить товар</button>
            </div>
            {showAddProduct && (
              <div className="admin-form">
                <label className="admin-form__label">Фото товара</label>
                <div className="admin-form__img-row">
                  {imagePreview && <img src={imagePreview} alt="preview" className="admin-form__img-preview" />}
                  <label className="admin-form__file-btn">
                    {imageFile ? imageFile.name : 'Выбрать фото…'}
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files[0]
                        if (!f) return
                        setImageFile(f)
                        setImagePreview(URL.createObjectURL(f))
                      }} />
                  </label>
                </div>
                <input className="admin-form__input" placeholder="Название" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} />
                <select className="admin-form__input" value={newProduct.categoryName} onChange={e => setNewProduct(p => ({ ...p, categoryName: e.target.value }))}>
                  <option value="">— Выберите категорию —</option>
                  {['Алоказии','Аглонемы','Антуриумы','Бегонии','Калатеи','Маранты','Монстеры','Орхидеи','Папоротники','Пеперомии','Сансевиерии','Суккуленты','Филодендроны','Фикусы','Разные'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <input className="admin-form__input" placeholder="Цена, ₽" type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} />
                  <input className="admin-form__input" placeholder="Остаток, шт." type="number" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))} />
                  <select className="admin-form__input" value={newProduct.care} onChange={e => setNewProduct(p => ({ ...p, care: e.target.value }))}>
                    <option value="легко">Уход: легко</option>
                    <option value="средне">Уход: средне</option>
                    <option value="сложно">Уход: сложно</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input className="admin-form__input" placeholder="Освещение" value={newProduct.light} onChange={e => setNewProduct(p => ({ ...p, light: e.target.value }))} />
                  <input className="admin-form__input" placeholder="Полив" value={newProduct.watering} onChange={e => setNewProduct(p => ({ ...p, watering: e.target.value }))} />
                </div>
                <textarea className="admin-form__input" placeholder="Описание товара" rows={3}
                  style={{ height: 'auto', padding: '10px 12px', resize: 'vertical' }}
                  value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary"   onClick={addProduct}>Сохранить</button>
                  <button className="btn btn-secondary" onClick={() => setShowAddProduct(false)}>Отмена</button>
                </div>
              </div>
            )}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>#</th><th>Фото</th><th>Название</th><th>Категория</th><th>Цена</th><th>Остаток</th><th></th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>
                        {p.image
                          ? <img src={p.image} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                          : <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>нет</span>}
                      </td>
                      <td>{p.name}</td>
                      <td>{p.categoryName || p.category}</td>
                      <td>
                        {editPrice[p.id] !== undefined ? (
                          <span className="admin-inline-edit">
                            <input className="admin-form__input admin-form__input--inline" type="number"
                              value={editPrice[p.id]} onChange={e => setEditPrice(prev => ({ ...prev, [p.id]: e.target.value }))} />
                            <button className="admin-action-btn admin-action-btn--save" onClick={() => savePrice(p)}>✓</button>
                          </span>
                        ) : (
                          <span className="admin-price-edit" onClick={() => setEditPrice(prev => ({ ...prev, [p.id]: p.price }))}>
                            {Number(p.price).toLocaleString('ru')} ₽ <span className="admin-price-edit__icon">✎</span>
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: (p.stock ?? (p.inStock ? 10 : 0)) === 0 ? '#e05a5a' : (p.stock ?? 10) <= 4 ? '#ff9800' : 'var(--color-primary)' }}>
                          {p.stock ?? (p.inStock ? '✓' : '✗')} шт.
                        </span>
                      </td>
                      <td>
                        <button className="admin-action-btn admin-action-btn--delete" onClick={() => deleteProduct(p.id)}>Удалить</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Сотрудники ── */}
        {tab === 'staff' && (
          <div>
            <div className="admin-toolbar">
              <span className="admin-toolbar__count">{staff.length} пользователей</span>
              <button className="btn btn-primary" onClick={() => setShowAddStaff(v => !v)}>+ Добавить сотрудника</button>
            </div>
            {showAddStaff && (
              <div className="admin-form">
                <input className="admin-form__input" placeholder="Имя"      value={newStaff.firstName} onChange={e => setNewStaff(s => ({ ...s, firstName: e.target.value }))} />
                <input className="admin-form__input" placeholder="Фамилия"  value={newStaff.lastName}  onChange={e => setNewStaff(s => ({ ...s, lastName: e.target.value }))} />
                <input className="admin-form__input" placeholder="Email"     value={newStaff.email}     onChange={e => setNewStaff(s => ({ ...s, email: e.target.value }))} />
                <input className="admin-form__input" placeholder="Пароль"   value={newStaff.password}  type="password" onChange={e => setNewStaff(s => ({ ...s, password: e.target.value }))} />
                <select className="admin-form__input" value={newStaff.role}  onChange={e => setNewStaff(s => ({ ...s, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                </select>
                <button className="btn btn-primary"   onClick={addStaff}>Сохранить</button>
                <button className="btn btn-secondary" onClick={() => setShowAddStaff(false)}>Отмена</button>
              </div>
            )}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>#</th><th>Имя</th><th>Email</th><th>Роль</th><th></th></tr></thead>
                <tbody>
                  {staff.map(s => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>{s.firstName} {s.lastName}</td>
                      <td>{s.email}</td>
                      <td>
                        <select className="admin-role-select" value={s.role}
                          onChange={e => changeRole(s.id, e.target.value)}>
                          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                        </select>
                      </td>
                      <td>
                        <button className="admin-action-btn admin-action-btn--delete"
                          disabled={s.email === user.email}
                          title={s.email === user.email ? 'Нельзя удалить себя' : ''}
                          onClick={() => deleteStaff(s.id)}>
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
