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

export type CoffeeType = 'Café en granos' | 'Café molido'
export type CoffeeWeight = '250g' | '500g' | '1kg'
export type CoffeeGrind = 'Espresso' | 'Moka' | 'Filtro / V60' | 'Prensa francesa' | 'Aeropress'

export interface CoffeeSelectionDetails {
  coffeeType: CoffeeType
  grind?: CoffeeGrind
  weight: CoffeeWeight
}

export interface CartItem
  extends Pick<MenuItem, 'name' | 'description' | 'price' | 'size'> {
  id: string
  quantity: number
  categoryName: string
  subtotal: number
  unitSubtotal: number
  coffeeType?: CoffeeType
  grind?: CoffeeGrind
  weight?: CoffeeWeight
}

interface CartContextValue {
  items: CartItem[]
  addItem: (item: MenuItem, categoryName: string, details?: CoffeeSelectionDetails) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, delta: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'artisan-cart'

function getWeightMultiplier(weight: CoffeeWeight): number {
  switch (weight) {
    case '250g':
      return 1
    case '500g':
      return 2
    case '1kg':
      return 4
  }
}

function buildCartKey(item: MenuItem, categoryName: string, details?: CoffeeSelectionDetails): string {
  if (!details) {
    return `menu-${item.name}-${categoryName}`
  }

  return ['coffee', item.name, details.coffeeType, details.grind ?? 'sin molienda', details.weight].join('|')
}

function createCartItem(
  item: MenuItem,
  categoryName: string,
  details?: CoffeeSelectionDetails
): CartItem {
  const weight = details?.weight ?? '250g'
  const unitSubtotal = details ? item.price * getWeightMultiplier(weight) : item.price

  return {
    id: buildCartKey(item, categoryName, details),
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStorage)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item: MenuItem, categoryName: string, details?: CoffeeSelectionDetails) => {
    setItems(prev => {
      const candidate = createCartItem(item, categoryName, details)
      const exists = prev.find(i => i.id === candidate.id)

      if (exists) {
        return prev.map(i =>
          i.id === candidate.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                subtotal: i.subtotal + i.unitSubtotal,
              }
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
