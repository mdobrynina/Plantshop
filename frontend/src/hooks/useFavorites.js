import { useState, useEffect } from 'react'

const KEY = 'moh_favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) ?? []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(favorites))
  }, [favorites])

  const toggle = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const isFavorite = (productId) => favorites.includes(productId)

  return { favorites, toggle, isFavorite, count: favorites.length }
}
