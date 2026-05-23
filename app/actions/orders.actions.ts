'use server'

import { createOrder, getOrders } from '@/lib/repositories/orders.repository'
import type { OrderRow, UUID } from '@/types/database'
import type { ActionResponse } from './types'

export interface OrdersActionResponse extends ActionResponse<OrderRow[]> {}
export interface CreateOrderActionResponse extends ActionResponse<OrderRow> {}

export async function createOrderAction(input: {
  customer_id: UUID
  status?: OrderRow['status']
  notes?: string | null
  items: Array<{
    product_id: UUID
    quantity: number
    unit_price: number
  }>
}): Promise<CreateOrderActionResponse> {
  try {
    const data = await createOrder(input)

    return {
      status: 'success',
      data,
    }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'No se pudo crear el pedido',
    }
  }
}

export async function getOrdersAction(customerId?: UUID): Promise<OrdersActionResponse> {
  try {
    const data = await getOrders(customerId)

    return {
      status: 'success',
      data,
    }
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'No se pudo obtener los pedidos',
    }
  }
}
