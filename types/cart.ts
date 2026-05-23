import type { UUID } from './database'

export interface CheckoutCustomer {
  full_name: string
  email: string
  phone?: string
  notes?: string
}

export interface CheckoutOrderItem {
  productId?: UUID
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type CheckoutResult =
  | { success: true; orderId: UUID }
  | { success: false; error: string }
