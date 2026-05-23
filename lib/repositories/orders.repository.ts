import { supabaseServer } from '@/lib/supabase/server'
import type { OrderRow, OrderItemRow, UUID } from '@/types/database'
import { RepositoryError, type CreateOrderInput } from './types'

function mapPostgrestError(message: string, errorCode?: string): RepositoryError {
  return new RepositoryError(message, errorCode)
}

export async function createOrder(input: CreateOrderInput): Promise<OrderRow> {
  const total = input.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  const { data: order, error: orderError } = await supabaseServer
    .from('orders')
    .insert({
      customer_id: input.customer_id,
      status: input.status ?? 'pending',
      order_type: input.order_type ?? 'menu',
      total,
      notes: input.notes ?? null,
    })
    .select()
    .single()

  if (orderError || !order) {
    throw mapPostgrestError('Failed to create order', orderError?.code)
  }

  const orderItems = input.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.quantity * item.unit_price,
  }))

  const { error: itemsError } = await supabaseServer.from('order_items').insert(orderItems)

  if (itemsError) {
    throw mapPostgrestError('Failed to create order items', itemsError.code)
  }

  return order as OrderRow
}

export async function getOrders(customerId?: UUID): Promise<OrderRow[]> {
  let query = supabaseServer.from('orders').select('*')

  if (customerId) {
    query = query.eq('customer_id', customerId)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    throw mapPostgrestError('Failed to fetch orders', error.code)
  }

  return (data ?? []) as OrderRow[]
}

export async function getOrderItems(orderId: UUID): Promise<OrderItemRow[]> {
  const { data, error } = await supabaseServer
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)

  if (error) {
    throw mapPostgrestError('Failed to fetch order items', error.code)
  }

  return (data ?? []) as OrderItemRow[]
}
