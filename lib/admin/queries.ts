// Server-only — never import from client components
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { OrderStatus, OrderType, ProductRow, ReservationStatus } from '@/types/database'
import type { OrderRow } from '@/app/admin/dashboard/_components/orders-table'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  todayOrders: number
  totalRevenue: number
  avgTicket: number
}

export interface RevenueDataPoint {
  date: string
  label: string
  revenue: number
  orders: number
}

export interface OrderTypeData {
  menu: number
  store: number
}

export interface StatusBreakdown {
  status: OrderStatus
  count: number
}

export interface TopProductData {
  name: string
  category: string
  quantity: number
  revenue: number
}

import { ORDERS_PAGE_SIZE } from './constants'
export { ORDERS_PAGE_SIZE } from './constants'

export interface OrderFilters {
  status?: OrderStatus | 'all'
  orderType?: OrderType | 'all'
  search?: string
  page?: number
}

export interface OrderItemDetail {
  id: string
  quantity: number
  unit_price: number
  subtotal: number
  product_name: string | null
  product_category: string | null
}

export interface OrderDetail {
  id: string
  status: OrderStatus
  order_type: OrderType
  total: number
  notes: string | null
  created_at: string
  customer: { full_name: string; email: string } | null
  items: OrderItemDetail[]
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    { count: total },
    { count: pending },
    { count: today },
    { data: revenueRows },
  ] = await Promise.all([
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
    supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString()),
    supabaseAdmin.from('orders').select('total').neq('status', 'cancelled'),
  ])

  const totalRevenue = (revenueRows ?? []).reduce(
    (sum, r) => sum + Number(r.total),
    0
  )
  const totalOrders = total ?? 0

  return {
    totalOrders,
    pendingOrders: pending ?? 0,
    todayOrders: today ?? 0,
    totalRevenue,
    avgTicket: totalOrders > 0 ? totalRevenue / totalOrders : 0,
  }
}

export async function getRevenueSeries(days: number): Promise<RevenueDataPoint[]> {
  const since = new Date()
  since.setDate(since.getDate() - (days - 1))
  since.setHours(0, 0, 0, 0)

  const { data } = await supabaseAdmin
    .from('orders')
    .select('total, created_at')
    .gte('created_at', since.toISOString())
    .neq('status', 'cancelled')

  const byDay = new Map<string, { revenue: number; orders: number }>()

  ;(data ?? []).forEach(row => {
    const key = row.created_at.split('T')[0]
    const curr = byDay.get(key) ?? { revenue: 0, orders: 0 }
    curr.revenue += Number(row.total)
    curr.orders += 1
    byDay.set(key, curr)
  })

  const result: RevenueDataPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const label = `${d.getDate()}/${d.getMonth() + 1}`
    const day = byDay.get(key) ?? { revenue: 0, orders: 0 }
    result.push({ date: key, label, ...day })
  }

  return result
}

export async function getOrdersByType(): Promise<OrderTypeData> {
  const [{ count: menu }, { count: store }] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_type', 'menu'),
    supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_type', 'store'),
  ])

  return { menu: menu ?? 0, store: store ?? 0 }
}

export async function getTopProducts(limit: number): Promise<TopProductData[]> {
  const { data } = await supabaseAdmin
    .from('order_items')
    .select('product_id, quantity, subtotal, products(name, category)')

  type RawItem = {
    product_id: string
    quantity: number
    subtotal: number
    products: { name: string; category: string }[] | { name: string; category: string } | null
  }

  const productMap = new Map<string, TopProductData>()

  ;((data ?? []) as RawItem[]).forEach(item => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products
    if (!product) return

    const existing = productMap.get(item.product_id)
    if (existing) {
      existing.quantity += item.quantity
      existing.revenue += Number(item.subtotal)
    } else {
      productMap.set(item.product_id, {
        name: product.name,
        category: product.category,
        quantity: item.quantity,
        revenue: Number(item.subtotal),
      })
    }
  })

  return Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
}

export async function getOrders(
  filters: OrderFilters = {}
): Promise<{ orders: OrderDetail[]; total: number; pages: number }> {
  const { status = 'all', orderType = 'all', search = '', page = 1 } = filters
  const offset = (page - 1) * ORDERS_PAGE_SIZE
  const safeTerm = search.trim().replace(/[,()]/g, '')

  // Resolve customer IDs for name/email search
  let customerIds: string[] | null = null
  if (safeTerm) {
    const { data } = await supabaseAdmin
      .from('customers')
      .select('id')
      .or(`full_name.ilike.%${safeTerm}%,email.ilike.%${safeTerm}%`)
    customerIds = (data ?? []).map(c => c.id)
  }

  // Search active but no customers matched — return empty early
  if (customerIds !== null && customerIds.length === 0) {
    return { orders: [], total: 0, pages: 0 }
  }

  let query = supabaseAdmin
    .from('orders')
    .select(
      'id, status, order_type, total, notes, created_at, customers(full_name, email), order_items(id, quantity, unit_price, subtotal, products(name, category))',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + ORDERS_PAGE_SIZE - 1)

  if (status !== 'all') {
    query = query.eq('status', status as OrderStatus)
  }
  if (orderType !== 'all') {
    query = query.eq('order_type', orderType as OrderType)
  }
  if (customerIds !== null && customerIds.length > 0) {
    query = query.in('customer_id', customerIds)
  }

  const { data, count } = await query

  type RawProduct = { name: string; category: string }
  type RawItem = {
    id: string
    quantity: number
    unit_price: number
    subtotal: number
    products: RawProduct | RawProduct[] | null
  }
  type RawCustomer = { full_name: string; email: string }
  type RawRow = {
    id: string
    status: string
    order_type: string
    total: number
    notes: string | null
    created_at: string
    customers: RawCustomer | RawCustomer[] | null
    order_items: RawItem[] | null
  }

  const orders: OrderDetail[] = ((data ?? []) as RawRow[]).map(row => {
    const rawCustomer = Array.isArray(row.customers)
      ? (row.customers[0] ?? null)
      : row.customers

    const items: OrderItemDetail[] = (row.order_items ?? []).map(item => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products
      return {
        id: item.id,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        subtotal: Number(item.subtotal),
        product_name: product?.name ?? null,
        product_category: product?.category ?? null,
      }
    })

    return {
      id: row.id,
      status: row.status as OrderStatus,
      order_type: row.order_type as OrderType,
      total: Number(row.total),
      notes: row.notes,
      created_at: row.created_at,
      customer: rawCustomer,
      items,
    }
  })

  const total = count ?? 0
  return { orders, total, pages: Math.ceil(total / ORDERS_PAGE_SIZE) }
}

export async function getAdminProducts(): Promise<ProductRow[]> {
  const { data } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (data ?? []) as ProductRow[]
}

export async function getRecentOrders(limit: number): Promise<OrderRow[]> {
  const { data } = await supabaseAdmin
    .from('orders')
    .select('id, status, order_type, total, notes, created_at, customers(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(limit)

  type RawOrderRow = {
    id: string
    status: string
    order_type: string
    total: number
    notes: string | null
    created_at: string
    customers:
      | { full_name: string; email: string }[]
      | { full_name: string; email: string }
      | null
  }

  return ((data ?? []) as RawOrderRow[]).map(row => ({
    ...row,
    status: row.status as OrderRow['status'],
    order_type: row.order_type as OrderRow['order_type'],
    customers: Array.isArray(row.customers)
      ? (row.customers[0] ?? null)
      : row.customers,
  }))
}

// ── Reservations ──────────────────────────────────────────────────────────────

export interface ReservationDetail {
  id: string
  reservation_date: string
  party_size: number
  status: ReservationStatus
  notes: string | null
  created_at: string
  customer: { full_name: string; email: string } | null
}

export interface ReservationFilters {
  status?: ReservationStatus | 'all'
  search?: string
}

// ── Admin tables ──────────────────────────────────────────────────────────────

export interface AdminTableView {
  id: string
  table_number: number
  name: string
  capacity: number
  sector: string
  qr_slug: string
  status: import('@/types/database').TableStatus
  today_reservations: number
}

export interface AdminTableReservation {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  reservation_date: string
  people_count: number
  notes: string | null
  status: import('@/types/database').TableReservationStatus
  created_at: string
}

export async function getAdminTables(): Promise<AdminTableView[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [{ data: tables }, { data: reservations }] = await Promise.all([
    supabaseAdmin
      .from('tables')
      .select('*')
      .order('table_number', { ascending: true }),
    supabaseAdmin
      .from('table_reservations')
      .select('table_id')
      .gte('reservation_date', today.toISOString())
      .lt('reservation_date', tomorrow.toISOString())
      .neq('status', 'cancelled'),
  ])

  const countByTable = new Map<string, number>()
  ;(reservations ?? []).forEach(r => {
    countByTable.set(r.table_id, (countByTable.get(r.table_id) ?? 0) + 1)
  })

  type RawTable = {
    id: string; table_number: number; name: string; capacity: number
    sector: string; qr_slug: string; status: string
  }

  return ((tables ?? []) as RawTable[]).map(t => ({
    id: t.id,
    table_number: t.table_number,
    name: t.name,
    capacity: t.capacity,
    sector: t.sector,
    qr_slug: t.qr_slug,
    status: t.status as import('@/types/database').TableStatus,
    today_reservations: countByTable.get(t.id) ?? 0,
  }))
}

export async function getTableReservationsForAdmin(
  tableId: string
): Promise<AdminTableReservation[]> {
  const { data } = await supabaseAdmin
    .from('table_reservations')
    .select('id, customer_name, customer_phone, customer_email, reservation_date, people_count, notes, status, created_at')
    .eq('table_id', tableId)
    .order('reservation_date', { ascending: true })

  type RawRes = {
    id: string; customer_name: string; customer_phone: string; customer_email: string
    reservation_date: string; people_count: number; notes: string | null
    status: string; created_at: string
  }

  return ((data ?? []) as RawRes[]).map(r => ({
    ...r,
    status: r.status as import('@/types/database').TableReservationStatus,
  }))
}

// ── Daily revenue (today vs yesterday) ───────────────────────────────────────

export interface DailyRevenueData {
  today: number
  yesterday: number
  todayOrders: number
  changePercent: number
}

export async function getDailyRevenue(): Promise<DailyRevenueData> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)

  const [{ data: todayData }, { data: yesterdayData }] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select('total')
      .gte('created_at', todayStart.toISOString())
      .neq('status', 'cancelled'),
    supabaseAdmin
      .from('orders')
      .select('total')
      .gte('created_at', yesterdayStart.toISOString())
      .lt('created_at', todayStart.toISOString())
      .neq('status', 'cancelled'),
  ])

  const today = (todayData ?? []).reduce((s, r) => s + Number(r.total), 0)
  const yesterday = (yesterdayData ?? []).reduce((s, r) => s + Number(r.total), 0)
  const changePercent = yesterday > 0 ? Math.round(((today - yesterday) / yesterday) * 100) : 0

  return { today, yesterday, todayOrders: (todayData ?? []).length, changePercent }
}

// ── Monthly comparison ────────────────────────────────────────────────────────

export interface MonthlyComparisonData {
  currentOrders: number
  prevOrders: number
  currentRevenue: number
  prevRevenue: number
  ordersChangePercent: number
  revenueChangePercent: number
}

export async function getMonthlyComparison(): Promise<MonthlyComparisonData> {
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [{ data: curr }, { data: prev }] = await Promise.all([
    supabaseAdmin
      .from('orders')
      .select('total')
      .gte('created_at', currentMonthStart.toISOString())
      .neq('status', 'cancelled'),
    supabaseAdmin
      .from('orders')
      .select('total')
      .gte('created_at', prevMonthStart.toISOString())
      .lt('created_at', currentMonthStart.toISOString())
      .neq('status', 'cancelled'),
  ])

  const currentRevenue = (curr ?? []).reduce((s, r) => s + Number(r.total), 0)
  const currentOrders = (curr ?? []).length
  const prevRevenue = (prev ?? []).reduce((s, r) => s + Number(r.total), 0)
  const prevOrders = (prev ?? []).length

  return {
    currentOrders,
    prevOrders,
    currentRevenue,
    prevRevenue,
    ordersChangePercent:
      prevOrders > 0 ? Math.round(((currentOrders - prevOrders) / prevOrders) * 100) : 0,
    revenueChangePercent:
      prevRevenue > 0 ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100) : 0,
  }
}

// ── Peak hours ────────────────────────────────────────────────────────────────

export interface PeakHourData {
  hour: number
  label: string
  orders: number
}

export async function getPeakHours(): Promise<PeakHourData[]> {
  const { data } = await supabaseAdmin
    .from('orders')
    .select('created_at')
    .neq('status', 'cancelled')

  const byHour = new Array(24).fill(0) as number[]

  // Timestamps are UTC; Argentina is UTC-3
  ;(data ?? []).forEach(row => {
    const localHour = (new Date(row.created_at).getUTCHours() - 3 + 24) % 24
    byHour[localHour]++
  })

  // Return business hours 6 AM–10 PM
  return byHour.slice(6, 23).map((orders, i) => {
    const h = i + 6
    const label = h === 12 ? '12PM' : h < 12 ? `${h}AM` : `${h - 12}PM`
    return { hour: h, label, orders }
  })
}

// ── Recurring customers ───────────────────────────────────────────────────────

export interface RecurringCustomersData {
  total: number
  recurring: number
  pct: number
}

export async function getRecurringCustomers(): Promise<RecurringCustomersData> {
  const { data } = await supabaseAdmin
    .from('orders')
    .select('customer_id')
    .neq('status', 'cancelled')

  if (!data || data.length === 0) return { total: 0, recurring: 0, pct: 0 }

  const counts = new Map<string, number>()
  data.forEach(r => counts.set(r.customer_id, (counts.get(r.customer_id) ?? 0) + 1))

  const total = counts.size
  const recurring = Array.from(counts.values()).filter(n => n >= 2).length

  return { total, recurring, pct: total > 0 ? Math.round((recurring / total) * 100) : 0 }
}

// ── Reservations ──────────────────────────────────────────────────────────────

export async function getAdminReservations(
  filters: ReservationFilters = {}
): Promise<ReservationDetail[]> {
  const { status = 'all', search = '' } = filters
  const safeTerm = search.trim().replace(/[,()]/g, '')

  let customerIds: string[] | null = null
  if (safeTerm) {
    const { data } = await supabaseAdmin
      .from('customers')
      .select('id')
      .or(`full_name.ilike.%${safeTerm}%,email.ilike.%${safeTerm}%`)
    customerIds = (data ?? []).map(c => c.id)
  }

  if (customerIds !== null && customerIds.length === 0) {
    return []
  }

  let query = supabaseAdmin
    .from('reservations')
    .select('id, reservation_date, party_size, status, notes, created_at, customers(full_name, email)')
    .order('reservation_date', { ascending: false })

  if (status !== 'all') {
    query = query.eq('status', status as ReservationStatus)
  }

  if (customerIds !== null && customerIds.length > 0) {
    query = query.in('customer_id', customerIds)
  }

  const { data } = await query

  type RawCustomer = { full_name: string; email: string }
  type RawRow = {
    id: string
    reservation_date: string
    party_size: number
    status: string
    notes: string | null
    created_at: string
    customers: RawCustomer | RawCustomer[] | null
  }

  return ((data ?? []) as RawRow[]).map(row => ({
    id: row.id,
    reservation_date: row.reservation_date,
    party_size: row.party_size,
    status: row.status as ReservationStatus,
    notes: row.notes,
    created_at: row.created_at,
    customer: Array.isArray(row.customers) ? (row.customers[0] ?? null) : row.customers,
  }))
}
