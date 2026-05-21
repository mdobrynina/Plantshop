import './Delivery.css'

const methods = [
  { icon: '🏪', title: 'Самовывоз', text: 'Вы можете забрать заказ в удобное время из нашей оранжереи' },
  { icon: '🚚', title: 'Курьер',    text: 'Выезд курьера в удобное для вас время по вашему адресу' },
  { icon: '📦', title: 'Почта',     text: 'Доставка Почтой России в любой город страны' },
  { icon: '🚀', title: 'Доставка',  text: 'Быстрая доставка до вашей двери в пределах дня' },
]

export default function Delivery() {
  return (
    <section className="delivery" id="delivery">
      <div className="container">
        <h2 className="delivery__title">Доставка заказов интернет-магазина</h2>
        <p className="delivery__text">
          Заказы интернет-магазина мы доставляем по всем регионам России.
          Точную информацию о способах доставки уточняйте у оператора в корзине
          при оформлении заказа или по телефону{' '}
          <a href="tel:88005553535" className="delivery__phone">8 (800) 555-35-35</a>.
        </p>

        <h3 className="delivery__subtitle">Варианты получения заказа</h3>
        <div className="delivery__grid">
          {methods.map((m) => (
            <div key={m.title} className="delivery-card">
              <div className="delivery-card__icon">{m.icon}</div>
              <h4 className="delivery-card__title">{m.title}</h4>
              <p className="delivery-card__text">{m.text}</p>
            </div>
          ))}
        </div>

        <div className="delivery__cta">
          <a href="#catalog" className="btn btn-primary">Начать покупку</a>
        </div>
      </div>
    </section>
  )
}
