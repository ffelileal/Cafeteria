'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { MenuItem } from './constants'

export interface CartItem
  extends Pick<MenuItem, 'name' | 'description' | 'price' | 'size'> {
  quantity: number
  categoryName: string
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: MenuItem, categoryName: string) => void
  removeItem: (name: string) => void
  updateQuantity: (name: string, delta: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'artisan-cart'

function readStorage(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStorage)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item: MenuItem, categoryName: string) => {
    setItems(prev => {
      const exists = prev.find(i => i.name === item.name)
      if (exists) {
        return prev.map(i =>
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [
        ...prev,
        {
          name: item.name,
          description: item.description,
          price: item.price,
          size: item.size,
          quantity: 1,
          categoryName,
        },
      ]
    })
  }, [])

  const removeItem = useCallback((name: string) => {
    setItems(prev => prev.filter(i => i.name !== name))
  }, [])

  const updateQuantity = useCallback((name: string, delta: number) => {
    setItems(prev =>
      prev
        .map(i => (i.name === name ? { ...i, quantity: i.quantity + delta } : i))
        .filter(i => i.quantity > 0)
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
