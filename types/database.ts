export type UUID = string

// ── Table system ───────────────────────────────────────────────────────────────

export type TableStatus = 'available' | 'reserved' | 'occupied'
export type TableReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type TableSector = 'Terraza' | 'Interior' | 'Ventana' | 'VIP'
export type ISODateString = string
export type Currency = number
export type PositiveInteger = number

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'

export type OrderType = 'menu' | 'store'

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export type ProductCategory =
  | 'espresso'
  | 'filter'
  | 'beans'
  | 'merchandise'
  | 'pastries'
  | 'cold-brew'
  | 'special'

export interface TimestampFields {
  created_at: ISODateString
  updated_at: ISODateString
}

export interface CustomerRow extends TimestampFields {
  id: UUID
  full_name: string
  email: string
  phone: string | null
  address: string | null
}

export interface ProductRow extends TimestampFields {
  id: UUID
  name: string
  description: string
  category: ProductCategory
  price: Currency
  image_url: string | null
  stock: PositiveInteger
  popularity: PositiveInteger
  is_active: boolean
}

export interface OrderRow extends TimestampFields {
  id: UUID
  customer_id: UUID
  status: OrderStatus
  order_type: OrderType
  total: Currency
  notes: string | null
}

export interface OrderItemRow extends TimestampFields {
  id: UUID
  order_id: UUID
  product_id: UUID
  quantity: PositiveInteger
  unit_price: Currency
  subtotal: Currency
}

export interface TableRow extends TimestampFields {
  id: UUID
  table_number: number
  name: string
  capacity: number
  sector: TableSector
  qr_slug: string
  status: TableStatus
}

export interface TableReservationRow extends TimestampFields {
  id: UUID
  table_id: UUID
  customer_name: string
  customer_phone: string
  customer_email: string
  reservation_date: ISODateString
  people_count: number
  notes: string | null
  status: TableReservationStatus
}

export interface ReservationRow extends TimestampFields {
  id: UUID
  customer_id: UUID
  reservation_date: ISODateString
  party_size: PositiveInteger
  status: ReservationStatus
  notes: string | null
}

export type DatabaseTableMap = {
  customers: CustomerRow
  products: ProductRow
  orders: OrderRow
  order_items: OrderItemRow
  reservations: ReservationRow
  tables: TableRow
  table_reservations: TableReservationRow
}

export type DatabaseTableName = keyof DatabaseTableMap

export type DatabaseRow<T extends DatabaseTableName> = DatabaseTableMap[T]

export type DatabaseInsert<T extends DatabaseTableName> = Omit<
  DatabaseRow<T>,
  'id' | 'created_at' | 'updated_at'
>

export type DatabaseUpdate<T extends DatabaseTableName> = Partial<
  Omit<DatabaseRow<T>, 'id' | 'created_at' | 'updated_at'>
>

export interface DatabaseRelationMap {
  customers: {
    orders: OrderRow[]
    reservations: ReservationRow[]
  }
  products: {
    order_items: OrderItemRow[]
  }
  orders: {
    order_items: OrderItemRow[]
    customer: CustomerRow
  }
  reservations: {
    customer: CustomerRow
  }
  order_items: {
    order: OrderRow
    product: ProductRow
  }
}

export type DatabaseRelationKey = keyof DatabaseRelationMap

export interface CustomerWithRelations extends CustomerRow {
  orders: OrderRow[]
  reservations: ReservationRow[]
}

export interface OrderWithRelations extends OrderRow {
  customer: CustomerRow
  order_items: OrderItemRow[]
}

export interface OrderItemWithRelations extends OrderItemRow {
  order: OrderRow
  product: ProductRow
}

export interface ProductWithRelations extends ProductRow {
  order_items: OrderItemRow[]
}

export interface ReservationWithRelations extends ReservationRow {
  customer: CustomerRow
}

export interface DatabaseSummary {
  customers: CustomerRow[]
  products: ProductRow[]
  orders: OrderRow[]
  order_items: OrderItemRow[]
  reservations: ReservationRow[]
}
