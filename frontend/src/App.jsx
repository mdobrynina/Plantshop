import { useState } from 'react'
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

// user = { token, email, fullName, role } | null
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

  const { favorites, toggle: toggleFavorite } = useFavorites()
  const {
    cart, addToCart, removeFromCart, changeQty,
    toggleSelect, toggleSelectAll, removeSelected,
    count: cartCount, selectedCount, selectedTotal,
  } = useCart()

  const sharedProps = {
    favorites,
    onToggleFavorite: toggleFavorite,
    onAddToCart: addToCart,
  }

  return (
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
              selectedTotal={selectedTotal}
            />
          }
        />
        <Route path="/profile" element={<ProfilePage user={user} onLogout={logout} favorites={favorites} />} />
        <Route path="/admin"   element={<AdminPage   user={user} />} />
        <Route path="/florist" element={<FloristPage user={user} />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
