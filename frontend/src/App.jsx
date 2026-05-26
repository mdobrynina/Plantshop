import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useFavorites } from './hooks/useFavorites.js'
import { useCart } from './hooks/useCart.js'
import Header from './components/Header/Header.jsx'
import Footer from './components/Footer/Footer.jsx'
import ScrollToHash from './components/ScrollToHash/ScrollToHash.jsx'
import HomePage from './pages/HomePage.jsx'
import CatalogPage from './pages/CatalogPage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import CartPage from './pages/CartPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import FloristPage from './pages/FloristPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { ToastProvider } from './components/Toast/Toast.jsx'

function loadUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function App() {
  const [user, setUser] = useState(loadUser)

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  // Авто-разлогин при истёкшем токене (событие из api.js)
  useEffect(() => {
    const handler = () => setUser(null)
    window.addEventListener('moh:logout', handler)
    return () => window.removeEventListener('moh:logout', handler)
  }, [])

  const { favorites, toggle: toggleFavorite } = useFavorites(user)
  const {
    cart, addToCart, removeFromCart, changeQty, clearCart,
    toggleSelect, toggleSelectAll, removeSelected,
    count: cartCount, selectedCount, selectedTotal,
  } = useCart(user)

  const cartIds = new Set(cart.map(i => i.id))

  // Promo state — поднят сюда чтобы скидка сохранялась при переходе корзина → оформление
  const [promoCode,     setPromoCode]     = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const discountAmount = promoDiscount ? Math.round(selectedTotal * promoDiscount / 100) : 0
  const finalTotal     = selectedTotal - discountAmount

  const sharedProps = {
    favorites,
    onToggleFavorite: toggleFavorite,
    onAddToCart: addToCart,
    cart,
    cartIds,
  }

  return (
    <ToastProvider>
    <BrowserRouter>
      <ScrollToHash />
      <Header
        favCount={favorites.length}
        cartCount={cartCount}
        user={user}
        onLogout={logout}
      />
      <Routes>
        <Route path="/" element={<HomePage {...sharedProps} />} />
        <Route path="/catalog" element={<CatalogPage {...sharedProps} />} />
        <Route path="/favorites" element={<FavoritesPage {...sharedProps} />} />
        <Route
          path="/cart"
          element={
            <CartPage
              cart={cart}
              onChangeQty={changeQty}
              onRemove={removeFromCart}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onRemoveSelected={removeSelected}
              selectedCount={selectedCount}
              selectedTotal={selectedTotal}
              promoCode={promoCode}
              promoDiscount={promoDiscount}
              onPromoChange={setPromoCode}
              onPromoDiscount={setPromoDiscount}
            />
          }
        />
        <Route path="/register" element={<RegisterPage onLogin={login} />} />
        <Route path="/login"    element={<LoginPage    onLogin={login} />} />
        <Route path="/product/:id" element={<ProductPage {...sharedProps} />} />
        <Route
          path="/checkout"
          element={
            <CheckoutPage
              cart={cart}
              selectedCount={selectedCount}
              selectedTotal={finalTotal}
              discountAmount={discountAmount}
              promoDiscount={promoDiscount}
              onClearCart={clearCart}
              user={user}
            />
          }
        />
        <Route path="/profile" element={<ProfilePage user={user} onLogout={logout} favorites={favorites} />} />
        <Route path="/admin"   element={<AdminPage   user={user} />} />
        <Route path="/florist" element={<FloristPage user={user} />} />
        <Route path="*"        element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
    </ToastProvider>
  )
}
