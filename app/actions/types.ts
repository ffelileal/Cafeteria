'use server'

import type { ProductRow, OrderRow, ReservationRow, CustomerRow } from '@/types/database'

export type ActionStatus = 'success' | 'error'

export interface ActionResponse<T> {
  status: ActionStatus
  data?: T
  error?: string
}

export interface ProductsActionResponse extends ActionResponse<ProductRow[]> {}
export interface FeaturedProductsActionResponse extends ActionResponse<ProductRow[]> {}
export interface OrdersActionResponse extends ActionResponse<OrderRow[]> {}
export interface ReservationsActionResponse extends ActionResponse<ReservationRow[]> {}
export interface CustomerActionResponse extends ActionResponse<CustomerRow> {}
