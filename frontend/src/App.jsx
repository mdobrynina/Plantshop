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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

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
        isLoggedIn={isLoggedIn}
        onLogout={() => setIsLoggedIn(false)}
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
        <Route path="/register" element={<RegisterPage onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/login"    element={<LoginPage    onLogin={() => setIsLoggedIn(true)} />} />
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
        <Route path="/profile" element={<ProfilePage favorites={favorites} />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
