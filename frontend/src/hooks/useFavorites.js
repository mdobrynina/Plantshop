import { useState, useEffect, useRef } from 'react'
import { api } from '../api/api'
import { toast } from '../components/Toast/Toast.jsx'

const KEY = 'moh_favorites'

function isLoggedIn() {
  try { return !!JSON.parse(localStorage.getItem('user')) } catch { return false }
}

export function useFavorites(user) {
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) ?? [] } catch { return [] }
  })

  // prevUserRef инициализируем текущим user-ом — чтобы merge не сработал на маунте
  const prevUserRef  = useRef(user)
  const favoritesRef = useRef(favorites)
  useEffect(() => { favoritesRef.current = favorites }, [favorites])

  // Если при маунте уже залогинен — грузим избранное с бэка
  useEffect(() => {
    if (!isLoggedIn()) return
    api.get('/favorites')
      .then(ids => { if (Array.isArray(ids) && ids.length > 0) setFavorites(ids) })
      .catch(() => {})
  }, [])

  // При логине (null → user) — мёрджим гостевое избранное с бэком
  useEffect(() => {
    const prevUser = prevUserRef.current
    prevUserRef.current = user

    if (!user || prevUser) return  // не событие логина

    const guestFavs = favoritesRef.current

    ;(async () => {
      try {
        const backendIds = await api.get('/favorites')
        const backendSet = new Set(Array.isArray(backendIds) ? backendIds : [])
        for (const id of guestFavs) {
          if (!backendSet.has(id)) {
            await api.post(`/favorites/${id}`, {}).catch(() => {})
            backendSet.add(id)
          }
        }
        const merged = await api.get('/favorites')
        if (Array.isArray(merged)) setFavorites(merged)
      } catch {}
    })()
  }, [user])

  // Синхронизируем localStorage при каждом изменении
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(favorites))
  }, [favorites])

  const toggle = (productId, productName) => {
    const has = favorites.includes(productId)
    setFavorites(prev =>
      has ? prev.filter(id => id !== productId) : [...prev, productId]
    )
    const name = productName || 'Товар'
    toast(has ? `${name} удалён из избранного` : `${name} добавлен в избранное`)
    if (isLoggedIn()) {
      if (has) api.delete(`/favorites/${productId}`).catch(() => {})
      else     api.post(`/favorites/${productId}`, {}).catch(() => {})
    }
  }

  const isFavorite = (productId) => favorites.includes(productId)

  return { favorites, toggle, isFavorite, count: favorites.length }
}
