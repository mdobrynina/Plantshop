import { useState, useEffect, useRef } from 'react'
import { api } from '../api/api'
import { toast } from '../components/Toast/Toast.jsx'

const KEY = 'moh_cart'

function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}

function apiToItem(ci) {
  return {
    id:          ci.product.id,
    name:        ci.product.name,
    price:       Number(ci.product.price),
    image:       ci.product.image ?? null,
    stock:       ci.product.stock ?? null,
    qty:         ci.quantity,
    selected:    true,
    _cartItemId: ci.id,
  }
}

export function useCart(user) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) ?? [] } catch { return [] }
  })

  const prevUserRef = useRef(user)
  const cartRef     = useRef(cart)
  useEffect(() => { cartRef.current = cart }, [cart])

  useEffect(() => {
    if (!getUser()) return
    api.get('/cart')
      .then(items => setCart(Array.isArray(items) ? items.map(apiToItem) : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const prevUser = prevUserRef.current
    prevUserRef.current = user

    if (!user || prevUser) return

    const guestItems = cartRef.current

    ;(async () => {
      try {
        const backendItems = await api.get('/cart')
        const backendIds   = new Set(
          (Array.isArray(backendItems) ? backendItems : []).map(ci => ci.product.id)
        )
        for (const item of guestItems) {
          if (!backendIds.has(item.id)) {
            await api.post('/cart/items', { productId: item.id, quantity: item.qty }).catch(() => {})
          }
        }
        const merged = await api.get('/cart')
        setCart(Array.isArray(merged) ? merged.map(apiToItem) : [])
      } catch {}
    })()
  }, [user])

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        const newQty = existing.qty + 1
        if (existing.stock != null && newQty > existing.stock) {
          toast(`В наличии только ${existing.stock} шт.`)
          return prev
        }
        if (getUser() && existing._cartItemId) {
          api.put(`/cart/items/${existing._cartItemId}?quantity=${newQty}`).catch(() => {})
        }
        toast(`${product.name} — ещё 1 шт. в корзине`)
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: newQty } : item
        )
      }
      toast(`${product.name} добавлен в корзину`)
      if (getUser()) {
        api.post('/cart/items', { productId: product.id, quantity: 1 })
          .then(ci => setCart(p => p.map(i => i.id === product.id ? { ...i, _cartItemId: ci.id } : i)))
          .catch(() => {})
      }
      return [...prev, { ...product, qty: 1, selected: true, _cartItemId: null }]
    })
  }

  const removeFromCart = (productId) => {
    setCart(prev => {
      const item = prev.find(i => i.id === productId)
      if (getUser() && item?._cartItemId) {
        api.delete(`/cart/items/${item._cartItemId}`).catch(() => {})
      }
      return prev.filter(i => i.id !== productId)
    })
  }

  const changeQty = (productId, delta) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id !== productId) return item
        const qty = item.qty + delta
        if (qty <= 0) return null
        if (delta > 0 && item.stock != null && qty > item.stock) {
          toast(`В наличии только ${item.stock} шт.`)
          return item
        }
        if (getUser() && item._cartItemId) {
          api.put(`/cart/items/${item._cartItemId}?quantity=${qty}`).catch(() => {})
        }
        return { ...item, qty }
      }).filter(Boolean)
    )
  }

  const clearCart = () => {
    setCart([])
    if (getUser()) api.delete('/cart').catch(() => {})
  }

  const toggleSelect    = (id) => setCart(prev => prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i))
  const toggleSelectAll = ()   => { const all = cart.every(i => i.selected); setCart(prev => prev.map(i => ({ ...i, selected: !all }))) }
  const removeSelected  = ()   => {
    cart.filter(i => i.selected).forEach(i => {
      if (getUser() && i._cartItemId) api.delete(`/cart/items/${i._cartItemId}`).catch(() => {})
    })
    setCart(prev => prev.filter(i => !i.selected))
  }

  const count         = cart.reduce((s, i) => s + i.qty, 0)
  const total         = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const selectedItems = cart.filter(i => i.selected)
  const selectedCount = selectedItems.reduce((s, i) => s + i.qty, 0)
  const selectedTotal = selectedItems.reduce((s, i) => s + i.price * i.qty, 0)

  return {
    cart, addToCart, removeFromCart, changeQty, clearCart,
    toggleSelect, toggleSelectAll, removeSelected,
    count, total, selectedCount, selectedTotal,
  }
}
