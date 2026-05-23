'use server'

import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { CheckoutCustomer, CheckoutOrderItem, CheckoutResult } from '@/types/cart'
import type { CustomerRow, OrderRow, OrderType } from '@/types/database'

const customerSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

const itemSchema = z.object({
  productId: z.string().uuid('ID de producto inválido').optional(),
  name: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  subtotal: z.number().positive(),
})

const checkoutSchema = z.object({
  customer: customerSchema,
  items: z.array(itemSchema).min(1, 'El carrito está vacío'),
  orderType: z.enum(['menu', 'store']).default('menu'),
})

export async function checkoutAction(
  customer: CheckoutCustomer,
  items: CheckoutOrderItem[],
  orderType: OrderType = 'menu'
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse({ customer, items, orderType })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? 'Datos inválidos',
    }
  }

  const { customer: validCustomer, items: validItems, orderType: validOrderType } = parsed.data

  // Find or create customer
  let customerId: string

  const { data: existing } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('email', validCustomer.email)
    .maybeSingle()

  if (existing) {
    customerId = (existing as Pick<CustomerRow, 'id'>).id
  } else {
    const { data: created, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        full_name: validCustomer.full_name,
        email: validCustomer.email,
        phone: validCustomer.phone ?? null,
        address: null,
      })
      .select('id')
      .single()

    if (customerError || !created) {
      return { success: false, error: 'No se pudo registrar el cliente' }
    }

    customerId = (created as Pick<CustomerRow, 'id'>).id
  }

  // Create order
  const total = validItems.reduce((sum, item) => sum + item.subtotal, 0)

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      customer_id: customerId,
      status: 'pending',
      order_type: validOrderType,
      total,
      notes: validCustomer.notes ?? null,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    return { success: false, error: 'No se pudo crear el pedido' }
  }

  const orderId = (order as Pick<OrderRow, 'id'>).id

  // Create order items (only for items linked to a DB product)
  const linkedItems = validItems.filter(item => !!item.productId)

  if (linkedItems.length > 0) {
    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(
      linkedItems.map(item => ({
        order_id: orderId,
        product_id: item.productId!,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.subtotal,
      }))
    )

    if (itemsError) {
      return { success: false, error: 'No se pudieron guardar los productos del pedido' }
    }
  }

  return { success: true, orderId }
}
