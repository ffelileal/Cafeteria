'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface OrdersNotificationCtx {
  newOrderCount: number
  addNewOrder: () => void
  clearNewOrders: () => void
}

const Ctx = createContext<OrdersNotificationCtx>({
  newOrderCount: 0,
  addNewOrder: () => {},
  clearNewOrders: () => {},
})

export function OrdersNotificationProvider({ children }: { children: React.ReactNode }) {
  const [newOrderCount, setNewOrderCount] = useState(0)

  const addNewOrder = useCallback(() => setNewOrderCount(c => c + 1), [])
  const clearNewOrders = useCallback(() => setNewOrderCount(0), [])

  return (
    <Ctx.Provider value={{ newOrderCount, addNewOrder, clearNewOrders }}>
      {children}
    </Ctx.Provider>
  )
}

export function useOrdersNotification() {
  return useContext(Ctx)
}
