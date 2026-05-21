import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './CheckoutPage.css'

const DELIVERY_METHODS = [
  { id: 'courier',  label: 'Курьер',     desc: 'До двери, 1–3 дня',        price: 350 },
  { id: 'pickup',   label: 'Самовывоз',  desc: 'Бесплатно, пункт выдачи',  price: 0   },
  { id: 'post',     label: 'Почта',      desc: 'По всей России, 5–14 дней', price: 200 },
]

function noun(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100
  if (m100 >= 11 && m100 <= 14) return many
  if (m10 === 1) return one
  if (m10 >= 2 && m10 <= 4) return few
  return many
}

export default function CheckoutPage({ cart, selectedCount, selectedTotal }) {
  const navigate = useNavigate()
  const selectedItems = cart.filter((i) => i.selected)

  const [delivery, setDelivery] = useState('courier')
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    address: '', city: '', comment: '',
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const deliveryPrice = DELIVERY_METHODS.find((m) => m.id === delivery)?.price ?? 0
  const total = selectedTotal + deliveryPrice

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.firstName.trim())  e.firstName = 'Введите имя'
    if (!form.lastName.trim())   e.lastName  = 'Введите фамилию'
    if (!form.phone.trim())      e.phone     = 'Введите телефон'
    if (!form.email.includes('@')) e.email   = 'Введите корректный email'
    if (delivery === 'courier' && !form.address.trim()) e.address = 'Введите адрес'
    if (delivery === 'courier' && !form.city.trim())    e.city    = 'Введите город'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }
    setSuccess(true)
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
          <div className="checkout-success">
            <div className="checkout-success__icon">🌿</div>
            <h1 className="checkout-success__title">Заказ оформлен!</h1>
            <p className="checkout-success__text">
              Спасибо за покупку! Мы свяжемся с вами по номеру{' '}
              <strong>{form.phone}</strong> для подтверждения заказа.
            </p>
            <Link to="/catalog" className="btn btn-primary">Продолжить покупки</Link>
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

            {/* Контактные данные */}
            <section className="checkout-section">
              <h2 className="checkout-section__title">Контактные данные</h2>
              <div className="checkout-row">
                <div className="checkout-field">
                  <input
                    type="text" placeholder="Имя"
                    className={`checkout-input ${errors.firstName ? 'checkout-input--error' : ''}`}
                    value={form.firstName} onChange={set('firstName')}
                  />
                  {errors.firstName && <span className="checkout-error">{errors.firstName}</span>}
                </div>
                <div className="checkout-field">
                  <input
                    type="text" placeholder="Фамилия"
                    className={`checkout-input ${errors.lastName ? 'checkout-input--error' : ''}`}
                    value={form.lastName} onChange={set('lastName')}
                  />
                  {errors.lastName && <span className="checkout-error">{errors.lastName}</span>}
                </div>
              </div>
              <div className="checkout-row">
                <div className="checkout-field">
                  <input
                    type="tel" placeholder="Телефон"
                    className={`checkout-input ${errors.phone ? 'checkout-input--error' : ''}`}
                    value={form.phone} onChange={set('phone')}
                  />
                  {errors.phone && <span className="checkout-error">{errors.phone}</span>}
                </div>
                <div className="checkout-field">
                  <input
                    type="email" placeholder="Email"
                    className={`checkout-input ${errors.email ? 'checkout-input--error' : ''}`}
                    value={form.email} onChange={set('email')}
                  />
                  {errors.email && <span className="checkout-error">{errors.email}</span>}
                </div>
              </div>
            </section>

            {/* Способ доставки */}
            <section className="checkout-section">
              <h2 className="checkout-section__title">Способ доставки</h2>
              <div className="checkout-delivery">
                {DELIVERY_METHODS.map((m) => (
                  <label
                    key={m.id}
                    className={`delivery-option ${delivery === m.id ? 'delivery-option--active' : ''}`}
                  >
                    <input
                      type="radio" name="delivery"
                      value={m.id} checked={delivery === m.id}
                      onChange={() => setDelivery(m.id)}
                    />
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
                <div className="checkout-row" style={{ marginTop: '16px' }}>
                  <div className="checkout-field">
                    <input
                      type="text" placeholder="Город"
                      className={`checkout-input ${errors.city ? 'checkout-input--error' : ''}`}
                      value={form.city} onChange={set('city')}
                    />
                    {errors.city && <span className="checkout-error">{errors.city}</span>}
                  </div>
                  <div className="checkout-field">
                    <input
                      type="text" placeholder="Адрес (улица, дом, кв.)"
                      className={`checkout-input ${errors.address ? 'checkout-input--error' : ''}`}
                      value={form.address} onChange={set('address')}
                    />
                    {errors.address && <span className="checkout-error">{errors.address}</span>}
                  </div>
                </div>
              )}
            </section>

            {/* Комментарий */}
            <section className="checkout-section">
              <h2 className="checkout-section__title">Комментарий к заказу</h2>
              <textarea
                className="checkout-input checkout-textarea"
                placeholder="Пожелания по доставке, упаковке и т.д."
                value={form.comment}
                onChange={set('comment')}
              />
            </section>

            <button type="submit" className="btn btn-primary checkout-submit">
              Оформить заказ — {total} ₽
            </button>
          </form>

          {/* Итоговый блок */}
          <aside className="checkout-summary">
            <h2 className="checkout-summary__title">Ваш заказ</h2>

            <div className="checkout-items">
              {selectedItems.map((item) => (
                <div key={item.id} className="checkout-item">
                  <img src={item.image} alt={item.name} className="checkout-item__img" />
                  <div className="checkout-item__info">
                    <p className="checkout-item__name">{item.name}</p>
                    <p className="checkout-item__qty">
                      {item.qty} {noun(item.qty, 'шт.', 'шт.', 'шт.')} × {item.price} ₽
                    </p>
                  </div>
                  <span className="checkout-item__total">{item.price * item.qty} ₽</span>
                </div>
              ))}
            </div>

            <div className="checkout-summary__divider" />

            <div className="checkout-summary__row">
              <span>Товары ({selectedCount})</span>
              <span>{selectedTotal} ₽</span>
            </div>
            <div className="checkout-summary__row">
              <span>Доставка</span>
              <span>{deliveryPrice === 0 ? 'Бесплатно' : `${deliveryPrice} ₽`}</span>
            </div>

            <div className="checkout-summary__divider" />

            <div className="checkout-summary__row checkout-summary__row--total">
              <span>Итого</span>
              <span>{total} ₽</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
