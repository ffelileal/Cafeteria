'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { CartItem, CoffeeSelectionDetails } from './cart-context'
import type { MenuItem } from './constants'

interface StoreCartContextValue {
  items: CartItem[]
  addItem: (item: MenuItem, categoryName: string, details?: CoffeeSelectionDetails, productId?: string) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, delta: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const StoreCartContext = createContext<StoreCartContextValue | null>(null)

const STORAGE_KEY = 'artisan-store-cart'

function getWeightMultiplier(weight: CoffeeSelectionDetails['weight']): number {
  switch (weight) {
    case '250g': return 1
    case '500g': return 2
    case '1kg': return 4
  }
}

function buildCartKey(item: MenuItem, categoryName: string, details?: CoffeeSelectionDetails): string {
  if (!details) return `store-${item.name}-${categoryName}`
  return ['store-coffee', item.name, details.coffeeType, details.grind ?? 'sin molienda', details.weight].join('|')
}

function createCartItem(
  item: MenuItem,
  categoryName: string,
  details?: CoffeeSelectionDetails,
  productId?: string
): CartItem {
  const weight = details?.weight ?? '250g'
  const unitSubtotal = details ? item.price * getWeightMultiplier(weight) : item.price

  return {
    id: buildCartKey(item, categoryName, details),
    productId,
    name: item.name,
    description: item.description,
    price: item.price,
    size: details?.weight ?? item.size,
    quantity: 1,
    categoryName,
    subtotal: unitSubtotal,
    unitSubtotal,
    coffeeType: details?.coffeeType,
    grind: details?.grind,
    weight: details?.weight,
  }
}

function readStorage(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function StoreCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setItems(readStorage())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, hydrated])

  const addItem = useCallback((item: MenuItem, categoryName: string, details?: CoffeeSelectionDetails, productId?: string) => {
    setItems(prev => {
      const candidate = createCartItem(item, categoryName, details, productId)
      const exists = prev.find(i => i.id === candidate.id)

      if (exists) {
        return prev.map(i =>
          i.id === candidate.id
            ? { ...i, quantity: i.quantity + 1, subtotal: i.subtotal + i.unitSubtotal }
            : i
        )
      }

      return [...prev, candidate]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems(prev =>
      prev
        .map(item =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity + delta,
                subtotal: Math.max(0, item.quantity + delta) * item.unitSubtotal,
              }
            : item
        )
        .filter(item => item.quantity > 0)
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0)

  return (
    <StoreCartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isOpen, setIsOpen }}
    >
      {children}
    </StoreCartContext.Provider>
  )
}

export function useStoreCart(): StoreCartContextValue {
  const ctx = useContext(StoreCartContext)
  if (!ctx) throw new Error('useStoreCart must be used within StoreCartProvider')
  return ctx
}
