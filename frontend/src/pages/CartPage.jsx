import { useState } from 'react'
import { Link } from 'react-router-dom'
import './CartPage.css'

const VALID_PROMO = { MOH10: 10, GREEN20: 20 }

function noun(n, one, few, many) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

export default function CartPage({
  cart,
  onChangeQty,
  onRemove,
  onToggleSelect,
  onToggleSelectAll,
  onRemoveSelected,
  selectedCount,
  selectedTotal,
}) {
  const allSelected = cart.length > 0 && cart.every((item) => item.selected)
  const hasSelected = cart.some((item) => item.selected)

  const [promoOpen,    setPromoOpen]    = useState(false)
  const [promoInput,   setPromoInput]   = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError,   setPromoError]   = useState('')
  const [promoApplied, setPromoApplied] = useState('')

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase()
    if (VALID_PROMO[code]) {
      setPromoDiscount(VALID_PROMO[code])
      setPromoApplied(code)
      setPromoError('')
    } else {
      setPromoError('Промокод не найден')
      setPromoDiscount(0)
      setPromoApplied('')
    }
  }

  const discountAmount = promoDiscount ? Math.round(selectedTotal * promoDiscount / 100) : 0
  const finalTotal = selectedTotal - discountAmount

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container cart-page__empty">
          <h1 className="cart-page__title">Корзина</h1>
          <p>Корзина пуста</p>
          <Link to="/catalog" className="btn btn-primary">Перейти в каталог</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="container cart-page__inner">

        {/* Список товаров */}
        <div className="cart-items">
          <h1 className="cart-page__title">
            Корзина{' '}
            <span className="cart-page__count">
              {cart.reduce((s, i) => s + i.qty, 0)}{' '}
              {noun(cart.reduce((s, i) => s + i.qty, 0), 'товар', 'товара', 'товаров')}
            </span>
          </h1>

          <div className="cart-toolbar">
            <label className="cart-checkbox">
              <input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} />
              <span>Выбрать все</span>
            </label>
            {hasSelected && (
              <button className="cart-toolbar__delete" onClick={onRemoveSelected}>
                🗑 {selectedCount} {noun(selectedCount, 'товар', 'товара', 'товаров')}
              </button>
            )}
          </div>

          <div className="cart-list">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <label className="cart-checkbox cart-item__check">
                  <input
                    type="checkbox"
                    checked={!!item.selected}
                    onChange={() => onToggleSelect(item.id)}
                  />
                </label>

                <div className="cart-item__card">
                  <div className="cart-item__img-wrap">
                    <img src={item.image} alt={item.name} className="cart-item__img" />
                  </div>
                  <div className="cart-item__info">
                    <div className="cart-item__meta">
                      <span>{item.categoryName}</span>
                      <span>Уход: {item.care}</span>
                    </div>
                    <p className="cart-item__name">{item.name}</p>
                    <div className="cart-item__footer">
                      <span className="cart-item__price">{item.price} ₽</span>
                      <div className="cart-item__qty">
                        <button onClick={() => onChangeQty(item.id, -1)}>−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => onChangeQty(item.id, +1)}>+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Сумма заказа */}
        <div className="cart-summary">
          <div className="cart-summary__box">
            <h2 className="cart-summary__title">Сумма заказа</h2>
            <div className="cart-summary__row">
              <span>
                {selectedCount}{' '}
                {noun(selectedCount, 'товар', 'товара', 'товаров')}
              </span>
              <span>{selectedTotal} ₽</span>
            </div>
            <div className="cart-summary__divider" />
            <div className="cart-summary__row cart-summary__row--total">
              <span>Итого</span>
              <span>{selectedTotal} ₽</span>
            </div>
            {discountAmount > 0 && (
              <div className="cart-summary__row cart-summary__row--discount">
                <span>Скидка {promoDiscount}%</span>
                <span>−{discountAmount} ₽</span>
              </div>
            )}
            <div className="cart-summary__divider" />
            <div className="cart-summary__row cart-summary__row--total">
              <span>Итого</span>
              <span>{finalTotal} ₽</span>
            </div>
            <p className="cart-summary__hint">Без учёта возможной стоимости доставки</p>
            {selectedCount > 0 ? (
              <Link to="/checkout" className="btn btn-primary cart-summary__btn">
                К оформлению<br />
                <small>{selectedCount} {noun(selectedCount, 'товар', 'товара', 'товаров')} · {finalTotal} ₽</small>
              </Link>
            ) : (
              <button className="btn btn-primary cart-summary__btn" disabled>
                Выберите товары
              </button>
            )}

            <div className="cart-promo">
              <button className="cart-promo__toggle" onClick={() => setPromoOpen((v) => !v)}>
                <span className="cart-promo__pct">%</span>
                Промокоды и сертификаты
                <span className="cart-promo__chevron">{promoOpen ? '∧' : '∨'}</span>
              </button>
              {promoOpen && (
                <div className="cart-promo__body">
                  {promoApplied ? (
                    <div className="cart-promo__applied">
                      Промокод <strong>{promoApplied}</strong> применён — скидка {promoDiscount}%
                      <button className="cart-promo__remove" onClick={() => { setPromoApplied(''); setPromoDiscount(0); setPromoInput('') }}>✕</button>
                    </div>
                  ) : (
                    <>
                      <div className="cart-promo__row">
                        <input
                          className="cart-promo__input"
                          placeholder="Введите промокод"
                          value={promoInput}
                          onChange={(e) => { setPromoInput(e.target.value); setPromoError('') }}
                          onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                        />
                        <button className="btn btn-primary cart-promo__apply" onClick={applyPromo}>
                          Применить
                        </button>
                      </div>
                      {promoError && <p className="cart-promo__error">{promoError}</p>}
                      <p className="cart-promo__hint">Попробуй: MOH10 или GREEN20</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="cart-summary__box cart-reg">
            <p className="cart-reg__text">
              Скидка 10% на первые 3 заказа после регистрации
            </p>
            <button className="btn btn-primary cart-reg__btn">Зарегистрироваться</button>
          </div>
        </div>

      </div>
    </div>
  )
}
