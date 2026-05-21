import { Link } from 'react-router-dom'
import './CartPage.css'

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
            <p className="cart-summary__hint">Без учёта возможной стоимости доставки</p>
            {selectedCount > 0 ? (
              <Link to="/checkout" className="btn btn-primary cart-summary__btn">
                К оформлению<br />
                <small>
                  {selectedCount} {noun(selectedCount, 'товар', 'товара', 'товаров')}{' '}
                  {selectedTotal} ₽
                </small>
              </Link>
            ) : (
              <button className="btn btn-primary cart-summary__btn" disabled>
                Выберите товары
              </button>
            )}

            <div className="cart-promo">
              <button className="cart-promo__toggle">
                <span>%</span> Промокоды и сертификаты
                <span className="cart-promo__chevron">∨</span>
              </button>
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
