'use server'

import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { CheckoutCustomer, CheckoutOrderItem, CheckoutResult } from '@/types/cart'
import type { CustomerRow, OrderRow } from '@/types/database'

const customerSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
  table_slug: z.string().optional(),
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
  orderType: import('@/types/database').OrderType = 'menu'
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse({ customer, items, orderType })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? 'Datos inválidos',
    }
  }

  const { customer: validCustomer, items: validItems, orderType: validOrderType } = parsed.data

  // Generate a guest email for mesa orders that don't provide one
  const resolvedEmail =
    validCustomer.email?.trim() ||
    `mesa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@artisan.local`

  // Build order notes — prepend mesa identifier when present
  const mesaNote = validCustomer.table_slug ? `🪑 Mesa: ${validCustomer.table_slug}` : null
  const userNote = validCustomer.notes?.trim() || null
  const orderNotes = [mesaNote, userNote].filter(Boolean).join('\n') || null

  // Resolve table_number from table_slug
  let tableNumber: number | null = null
  if (validCustomer.table_slug) {
    const { data: tableRow } = await supabaseAdmin
      .from('tables')
      .select('table_number')
      .eq('qr_slug', validCustomer.table_slug)
      .maybeSingle()
    tableNumber = (tableRow as { table_number: number } | null)?.table_number ?? null
  }

  // Find or create customer
  let customerId: string

  const { data: existing } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('email', resolvedEmail)
    .maybeSingle()

  if (existing) {
    customerId = (existing as Pick<CustomerRow, 'id'>).id
  } else {
    const { data: created, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        full_name: validCustomer.full_name,
        email: resolvedEmail,
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

  // Stock validation — check before creating the order
  const linkedItems = validItems.filter(item => !!item.productId)

  if (linkedItems.length > 0) {
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, stock, name')
      .in('id', linkedItems.map(i => i.productId!))

    type StockRow = { id: string; stock: number; name: string }
    const stockMap = new Map(((products ?? []) as StockRow[]).map(p => [p.id, p]))

    for (const item of linkedItems) {
      const product = stockMap.get(item.productId!)
      if (!product || item.quantity > product.stock) {
        return {
          success: false,
          error: `Stock insuficiente para "${item.name}"`,
        }
      }
    }
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
      notes: orderNotes,
      table_number: tableNumber,
      table_slug: validCustomer.table_slug ?? null,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    return { success: false, error: 'No se pudo crear el pedido' }
  }

  const orderId = (order as Pick<OrderRow, 'id'>).id

  // Insert order items
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

    // Decrement stock via RPC — safe, runs in DB, never goes below 0
    await Promise.all(
      linkedItems.map(item =>
        supabaseAdmin.rpc('decrement_stock', {
          p_product_id: item.productId!,
          p_qty: item.quantity,
        })
      )
    )
  }

  return { success: true, orderId }
}
