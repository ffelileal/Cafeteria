import type { OrderStatus, OrderType, ProductCategory, ReservationStatus, TableReservationStatus, UUID } from '@/types/database'

export interface CreateTableReservationInput {
  table_id: UUID
  customer_name: string
  customer_phone: string
  customer_email: string
  reservation_date: string
  people_count: number
  notes?: string | null
  status?: TableReservationStatus
}

export interface RepositoryErrorShape {
  message: string
  code?: string
}

export class RepositoryError extends Error {
  readonly code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'RepositoryError'
    this.code = code
  }
}

export interface CreateCustomerInput {
  full_name: string
  email: string
  phone?: string | null
  address?: string | null
}

export interface CreateReservationInput {
  customer_id: UUID
  reservation_date: string
  party_size: number
  status?: ReservationStatus
  notes?: string | null
}

export interface OrderItemInput {
  product_id: UUID
  quantity: number
  unit_price: number
}

export interface CreateOrderInput {
  customer_id: UUID
  status?: OrderStatus
  order_type?: OrderType
  notes?: string | null
  items: OrderItemInput[]
}

export interface RepositoryResponse<T> {
  data: T | null
  error: RepositoryError | null
}

export type FilterOptions = {
  limit?: number
  orderBy?: 'created_at' | 'popularity' | 'price'
  ascending?: boolean
}
