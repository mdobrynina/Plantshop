import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useFavorites } from './hooks/useFavorites.js'
import { useCart } from './hooks/useCart.js'
import Header from './components/Header/Header.jsx'
import Footer from './components/Footer/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import CatalogPage from './pages/CatalogPage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'

export default function App() {
  const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites()
  const { cart, addToCart, count: cartCount } = useCart()

  const sharedProps = {
    favorites,
    onToggleFavorite: toggleFavorite,
    onAddToCart: addToCart,
  }

  return (
    <BrowserRouter>
      <Header favCount={favorites.length} cartCount={cartCount} />
      <Routes>
        <Route path="/" element={<HomePage {...sharedProps} />} />
        <Route path="/catalog" element={<CatalogPage {...sharedProps} />} />
        <Route path="/favorites" element={<FavoritesPage {...sharedProps} />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
