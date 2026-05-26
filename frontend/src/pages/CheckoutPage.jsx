import { useState, useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { api } from '../api/api.js'
import './CheckoutPage.css'

const DELIVERY_METHODS = [
  { id: 'courier',  label: 'Курьер',    desc: 'До двери, 1–3 дня',        price: 350 },
  { id: 'pickup',   label: 'Самовывоз', desc: 'Бесплатно, пункт выдачи',  price: 0   },
  { id: 'post',     label: 'Почта',     desc: 'По всей России, 5–14 дней', price: 200 },
]

const CITIES = [
  'Москва','Санкт-Петербург','Новосибирск','Екатеринбург','Казань',
  'Нижний Новгород','Челябинск','Самара','Уфа','Ростов-на-Дону',
  'Краснодар','Омск','Воронеж','Пермь','Волгоград','Красноярск',
  'Саратов','Тюмень','Тольятти','Ижевск',
]

const TEST_CARD = { number: '4242 4242 4242 4242', expiry: '12/26', cvv: '123', name: 'TEST USER' }

// Маска телефона: +7 (XXX) XXX-XX-XX
function maskPhone(raw) {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('8')) d = '7' + d.slice(1)
  if (d.startsWith('7')) d = d.slice(1)
  d = d.slice(0, 10)
  if (!d) return '+7'
  if (d.length <= 3)  return `+7 (${d}`
  if (d.length <= 6)  return `+7 (${d.slice(0,3)}) ${d.slice(3)}`
  if (d.length <= 8)  return `+7 (${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`
  return `+7 (${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6,8)}-${d.slice(8)}`
}

function maskCardNumber(raw) {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function maskExpiry(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d
}

function loadInitialForm() {
  try {
    const profile  = JSON.parse(localStorage.getItem('moh_profile')  || 'null')
    const delivery = JSON.parse(localStorage.getItem('moh_delivery') || 'null')
    const user     = JSON.parse(localStorage.getItem('user')          || 'null')
    const [fn = '', ln = ''] = (user?.fullName ?? '').split(' ')
    return {
      firstName: profile?.firstName || fn,
      lastName:  profile?.lastName  || ln,
      phone:     delivery?.phone || profile?.phone || '',
      email:     user?.email || '',
      city:      delivery?.city      || '',
      street:    delivery?.street    || '',
      house:     delivery?.house     || '',
      apartment: delivery?.apartment || '',
      entrance:  delivery?.entrance  || '',
      comment: '',
    }
  } catch {
    return { firstName: '', lastName: '', phone: '', email: '', city: '', street: '', house: '', apartment: '', entrance: '', comment: '' }
  }
}

function noun(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100
  if (m100 >= 11 && m100 <= 14) return many
  if (m10 === 1) return one
  if (m10 >= 2 && m10 <= 4) return few
  return many
}

export default function CheckoutPage({ cart, selectedCount, selectedTotal, discountAmount = 0, promoDiscount = 0, onClearCart, user }) {
  if (!user) return <Navigate to="/login" state={{ from: '/checkout' }} replace />

  const selectedItems = cart.filter((i) => i.selected)

  const [delivery,   setDelivery]   = useState('courier')
  const [payMethod,  setPayMethod]  = useState('card')
  const [form,       setForm]       = useState(loadInitialForm)
  const [card,       setCard]       = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [errors,     setErrors]     = useState({})
  const [loading,    setLoading]    = useState(false)
  const [success,    setSuccess]    = useState(false)
  const [orderId,    setOrderId]    = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => navigate('/profile?tab=orders'), 3000)
    return () => clearTimeout(t)
  }, [success, navigate])

  const deliveryPrice = DELIVERY_METHODS.find((m) => m.id === delivery)?.price ?? 0
  const total = selectedTotal + deliveryPrice  // selectedTotal уже с учётом скидки

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }))
    setErrors((p) => ({ ...p, [field]: undefined }))
  }

  const setPhone = (e) => {
    setForm((p) => ({ ...p, phone: maskPhone(e.target.value) }))
    setErrors((p) => ({ ...p, phone: undefined }))
  }

  const setCardField = (field) => (e) => {
    let v = e.target.value
    if (field === 'number') v = maskCardNumber(v)
    if (field === 'expiry') v = maskExpiry(v)
    if (field === 'cvv')    v = v.replace(/\D/g, '').slice(0, 3)
    setCard((p) => ({ ...p, [field]: v }))
    setErrors((p) => ({ ...p, ['card_' + field]: undefined }))
  }

  const fillTestCard = () => setCard(TEST_CARD)

  const validate = () => {
    const e = {}
    if (!form.firstName.trim())  e.firstName = 'Введите имя'
    if (!form.lastName.trim())   e.lastName  = 'Введите фамилию'
    if (form.phone.replace(/\D/g, '').length < 11) e.phone = 'Введите полный номер (+7 и 10 цифр)'
    if (!form.email.includes('@')) e.email   = 'Введите корректный email'
    if (delivery === 'courier') {
      if (!form.city.trim())   e.city   = 'Введите город'
      if (!form.street.trim()) e.street = 'Введите улицу'
      if (!form.house.trim())  e.house  = 'Введите дом'
    }
    if (payMethod === 'card') {
      if (card.number.replace(/\D/g, '').length < 16) e.card_number = 'Введите номер карты'
      if (card.expiry.length < 5)  e.card_expiry = 'Введите срок'
      if (card.cvv.length < 3)     e.card_cvv    = 'Введите CVV'
      if (!card.name.trim())       e.card_name   = 'Введите имя на карте'
    }
    return e
  }

  const buildAddress = () => {
    if (delivery !== 'courier') return ''
    const parts = [form.city, `ул. ${form.street}`, `д. ${form.house}`]
    if (form.apartment) parts.push(`кв. ${form.apartment}`)
    if (form.entrance)  parts.push(`подъезд ${form.entrance}`)
    return parts.join(', ')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const order = await api.post('/orders', {
        items:        selectedItems.map((i) => ({ productId: i.id, quantity: i.qty })),
        deliveryType: delivery,
        address:      buildAddress(),
        phone:        form.phone,
        comment:      form.comment,
        total,
      })
      setOrderId(order?.id ?? null)
      localStorage.setItem('moh_delivery', JSON.stringify({
        phone: form.phone, city: form.city, street: form.street,
        house: form.house, apartment: form.apartment, entrance: form.entrance,
      }))
      setSuccess(true)
      onClearCart?.()
    } catch (err) {
      setErrors({ server: err.message || 'Не удалось оформить заказ. Попробуй ещё раз.' })
    } finally {
      setLoading(false)
    }
  }

  if (selectedItems.length === 0) {
    return (
      <div className="checkout-page checkout-page--empty">
        <div className="container">
          <h1>Оформление заказа</h1>
          <p>В корзине нет выбранных товаров</p>
          <Link to="/cart" className="btn btn-primary">В корзину</Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="checkout-page checkout-page--success">
        <div className="container">
          <div className="checkout-success__icon">🌿</div>
          <h1 className="checkout-success__title">Заказ оформлен!</h1>
          {orderId && <p className="checkout-success__order-id">Заказ #{orderId}</p>}
          <div className="checkout-success__info-block">
            <div className="checkout-success__info-row">
              <span>Статус</span>
              <span className="checkout-success__status">Новый — принят в обработку</span>
            </div>
            <div className="checkout-success__info-row">
              <span>Телефон</span>
              <span>{form.phone}</span>
            </div>
            <div className="checkout-success__info-row">
              <span>Чек отправлен на</span>
              <span>{form.email}</span>
            </div>
          </div>
          <p className="checkout-success__text">
            Чек отправлен на <b>{form.email}</b>. Если письмо не пришло — проверь папку «Спам».
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Переходим в личный кабинет через несколько секунд...
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/profile?tab=orders" className="btn btn-primary">Мои заказы</Link>
            <Link to="/catalog" className="btn btn-secondary">Продолжить покупки</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb__link">Главная</Link>
          <span className="breadcrumb__sep">›</span>
          <Link to="/cart" className="breadcrumb__link">Корзина</Link>
          <span className="breadcrumb__sep">›</span>
          <span>Оформление</span>
        </nav>

        <h1 className="checkout-page__title">Оформление заказа</h1>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit} noValidate>

            {/* ── Контактные данные ── */}
            <section className="checkout-section">
              <h2 className="checkout-section__title">Контактные данные</h2>
              <div className="checkout-row">
                <div className="checkout-field">
                  <input type="text" placeholder="Имя"
                    className={`checkout-input ${errors.firstName ? 'checkout-input--error' : ''}`}
                    value={form.firstName} onChange={set('firstName')} />
                  {errors.firstName && <span className="checkout-error">{errors.firstName}</span>}
                </div>
                <div className="checkout-field">
                  <input type="text" placeholder="Фамилия"
                    className={`checkout-input ${errors.lastName ? 'checkout-input--error' : ''}`}
                    value={form.lastName} onChange={set('lastName')} />
                  {errors.lastName && <span className="checkout-error">{errors.lastName}</span>}
                </div>
              </div>
              <div className="checkout-row" style={{ marginTop: '12px' }}>
                <div className="checkout-field">
                  <input type="tel" placeholder="+7 (___) ___-__-__"
                    className={`checkout-input ${errors.phone ? 'checkout-input--error' : ''}`}
                    value={form.phone} onChange={setPhone}
                    onFocus={(e) => { if (!e.target.value) setForm(p => ({ ...p, phone: '+7' })) }} />
                  {errors.phone && <span className="checkout-error">{errors.phone}</span>}
                </div>
                <div className="checkout-field">
                  <input type="email" placeholder="Email"
                    className={`checkout-input ${errors.email ? 'checkout-input--error' : ''}`}
                    value={form.email} onChange={set('email')} />
                  {errors.email && <span className="checkout-error">{errors.email}</span>}
                </div>
              </div>
            </section>

            {/* ── Способ доставки ── */}
            <section className="checkout-section">
              <h2 className="checkout-section__title">Способ доставки</h2>
              <div className="checkout-delivery">
                {DELIVERY_METHODS.map((m) => (
                  <label key={m.id}
                    className={`delivery-option ${delivery === m.id ? 'delivery-option--active' : ''}`}>
                    <input type="radio" name="delivery" value={m.id}
                      checked={delivery === m.id} onChange={() => setDelivery(m.id)} />
                    <div className="delivery-option__info">
                      <span className="delivery-option__label">{m.label}</span>
                      <span className="delivery-option__desc">{m.desc}</span>
                    </div>
                    <span className="delivery-option__price">
                      {m.price === 0 ? 'Бесплатно' : `${m.price} ₽`}
                    </span>
                  </label>
                ))}
              </div>

              {delivery === 'courier' && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Город */}
                  <div className="checkout-field">
                    <input list="cities-list" placeholder="Город"
                      className={`checkout-input ${errors.city ? 'checkout-input--error' : ''}`}
                      value={form.city} onChange={set('city')} />
                    <datalist id="cities-list">
                      {CITIES.map(c => <option key={c} value={c} />)}
                    </datalist>
                    {errors.city && <span className="checkout-error">{errors.city}</span>}
                  </div>
                  {/* Улица + Дом */}
                  <div className="checkout-row">
                    <div className="checkout-field">
                      <input type="text" placeholder="Улица"
                        className={`checkout-input ${errors.street ? 'checkout-input--error' : ''}`}
                        value={form.street} onChange={set('street')} />
                      {errors.street && <span className="checkout-error">{errors.street}</span>}
                    </div>
                    <div className="checkout-field">
                      <input type="text" placeholder="Дом"
                        className={`checkout-input ${errors.house ? 'checkout-input--error' : ''}`}
                        value={form.house} onChange={set('house')} />
                      {errors.house && <span className="checkout-error">{errors.house}</span>}
                    </div>
                  </div>
                  {/* Квартира + Подъезд */}
                  <div className="checkout-row">
                    <div className="checkout-field">
                      <input type="text" placeholder="Квартира (необязательно)"
                        className="checkout-input"
                        value={form.apartment} onChange={set('apartment')} />
                    </div>
                    <div className="checkout-field">
                      <input type="text" placeholder="Подъезд (необязательно)"
                        className="checkout-input"
                        value={form.entrance} onChange={set('entrance')} />
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* ── Способ оплаты ── */}
            <section className="checkout-section">
              <h2 className="checkout-section__title">Способ оплаты</h2>
              <div className="checkout-delivery">
                <label className={`delivery-option ${payMethod === 'card' ? 'delivery-option--active' : ''}`}>
                  <input type="radio" name="pay" value="card"
                    checked={payMethod === 'card'} onChange={() => setPayMethod('card')} />
                  <div className="delivery-option__info">
                    <span className="delivery-option__label">💳 Банковская карта</span>
                    <span className="delivery-option__desc">Visa, Mastercard, Мир</span>
                  </div>
                </label>
                <label className={`delivery-option ${payMethod === 'cash' ? 'delivery-option--active' : ''}`}>
                  <input type="radio" name="pay" value="cash"
                    checked={payMethod === 'cash'} onChange={() => setPayMethod('cash')} />
                  <div className="delivery-option__info">
                    <span className="delivery-option__label">💵 При получении</span>
                    <span className="delivery-option__desc">Наличными или картой курьеру</span>
                  </div>
                </label>
              </div>

              {payMethod === 'card' && (
                <div className="checkout-card-form">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Данные карты</span>
                    <button type="button" className="checkout-test-card-btn" onClick={fillTestCard}>
                      Вставить тестовую карту
                    </button>
                  </div>
                  <div className="checkout-field" style={{ marginBottom: '10px' }}>
                    <input type="text" placeholder="0000 0000 0000 0000" maxLength={19}
                      className={`checkout-input checkout-input--mono ${errors.card_number ? 'checkout-input--error' : ''}`}
                      value={card.number} onChange={setCardField('number')} />
                    {errors.card_number && <span className="checkout-error">{errors.card_number}</span>}
                  </div>
                  <div className="checkout-row">
                    <div className="checkout-field">
                      <input type="text" placeholder="ММ/ГГ" maxLength={5}
                        className={`checkout-input checkout-input--mono ${errors.card_expiry ? 'checkout-input--error' : ''}`}
                        value={card.expiry} onChange={setCardField('expiry')} />
                      {errors.card_expiry && <span className="checkout-error">{errors.card_expiry}</span>}
                    </div>
                    <div className="checkout-field">
                      <input type="text" placeholder="CVV" maxLength={3}
                        className={`checkout-input checkout-input--mono ${errors.card_cvv ? 'checkout-input--error' : ''}`}
                        value={card.cvv} onChange={setCardField('cvv')} />
                      {errors.card_cvv && <span className="checkout-error">{errors.card_cvv}</span>}
                    </div>
                  </div>
                  <div className="checkout-field" style={{ marginTop: '10px' }}>
                    <input type="text" placeholder="Имя на карте (латиницей)"
                      className={`checkout-input ${errors.card_name ? 'checkout-input--error' : ''}`}
                      value={card.name} onChange={setCardField('name')}
                      style={{ textTransform: 'uppercase' }} />
                    {errors.card_name && <span className="checkout-error">{errors.card_name}</span>}
                  </div>
                </div>
              )}
            </section>

            {/* ── Комментарий ── */}
            <section className="checkout-section">
              <h2 className="checkout-section__title">Комментарий к заказу</h2>
              <textarea className="checkout-input checkout-textarea"
                placeholder="Пожелания по доставке, упаковке и т.д."
                value={form.comment} onChange={set('comment')} />
            </section>

            {errors.server && (
              <p className="checkout-server-error">{errors.server}</p>
            )}

            <button type="submit" className="btn btn-primary checkout-submit" disabled={loading}>
              {loading ? 'Оформляю...' : `Оформить заказ — ${total.toLocaleString('ru')} ₽`}
            </button>
          </form>

          {/* ── Итоговый блок ── */}
          <aside className="checkout-summary">
            <h2 className="checkout-summary__title">Ваш заказ</h2>
            <div className="checkout-items">
              {selectedItems.map((item) => (
                <div key={item.id} className="checkout-item">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="checkout-item__img" />
                    : <div className="checkout-item__img" style={{ background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🌿</div>
                  }
                  <div className="checkout-item__info">
                    <p className="checkout-item__name">{item.name}</p>
                    <p className="checkout-item__qty">
                      {item.qty} {noun(item.qty, 'шт.', 'шт.', 'шт.')} × {item.price.toLocaleString('ru')} ₽
                    </p>
                  </div>
                  <span className="checkout-item__total">{(item.price * item.qty).toLocaleString('ru')} ₽</span>
                </div>
              ))}
            </div>

            <div className="checkout-summary__divider" />
            <div className="checkout-summary__row">
              <span>Товары ({selectedCount})</span>
              <span>{(selectedTotal + discountAmount).toLocaleString('ru')} ₽</span>
            </div>
            {discountAmount > 0 && (
              <div className="checkout-summary__row" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                <span>Скидка {promoDiscount}%</span>
                <span>−{discountAmount.toLocaleString('ru')} ₽</span>
              </div>
            )}
            <div className="checkout-summary__row">
              <span>Доставка</span>
              <span>{deliveryPrice === 0 ? 'Бесплатно' : `${deliveryPrice} ₽`}</span>
            </div>
            <div className="checkout-summary__divider" />
            <div className="checkout-summary__row checkout-summary__row--total">
              <span>Итого</span>
              <span>{total.toLocaleString('ru')} ₽</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
