import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useFavorites } from './hooks/useFavorites.js'
import { useCart } from './hooks/useCart.js'
import Header from './components/Header/Header.jsx'
import Footer from './components/Footer/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import CatalogPage from './pages/CatalogPage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import CartPage from './pages/CartPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import ScrollToHash from './components/ScrollToHash/ScrollToHash.jsx'

export default function App() {
  const { favorites, toggle: toggleFavorite } = useFavorites()
  const {
    cart,
    addToCart,
    removeFromCart,
    changeQty,
    toggleSelect,
    toggleSelectAll,
    removeSelected,
    count: cartCount,
    selectedCount,
    selectedTotal,
  } = useCart()

  const sharedProps = {
    favorites,
    onToggleFavorite: toggleFavorite,
    onAddToCart: addToCart,
  }

  return (
    <BrowserRouter>
      <ScrollToHash />
      <Header favCount={favorites.length} cartCount={cartCount} />
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
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/product/:id" element={<ProductPage {...sharedProps} />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
