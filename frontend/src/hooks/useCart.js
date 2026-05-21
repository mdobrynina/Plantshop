import { useState, useEffect } from 'react'

const KEY = 'moh_cart'

export function useCart() {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) ?? []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  const count = cart.reduce((sum, item) => sum + item.qty, 0)
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  return { cart, addToCart, removeFromCart, count, total }
}
