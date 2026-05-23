// Server-only — never import from client components
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { OrderStatus, OrderType, ProductRow, ReservationStatus } from '@/types/database'
import type { OrderRow } from '@/app/admin/dashboard/_components/orders-table'

// ── Date range ────────────────────────────────────────────────────────────────

export interface DateRange {
  from: string  // YYYY-MM-DD
  to: string    // YYYY-MM-DD
}

function toISORange(range?: DateRange): { from: string | null; to: string | null } {
  if (!range) return { from: null, to: null }
  const f = new Date(range.from); f.setHours(0, 0, 0, 0)
  const t = new Date(range.to);   t.setHours(23, 59, 59, 999)
  return { from: f.toISOString(), to: t.toISOString() }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  cancelledOrders: number
  completedOrders: number
  todayOrders: number
  totalRevenue: number
  avgTicket: number
  activeReservations: number   // pending + confirmed reservations (current state)
  occupiedTables: number       // tables with status = 'occupied' (current state)
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

export async function getDashboardStats(range?: DateRange): Promise<DashboardStats> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { from, to } = toISORange(range)

  let qTotal     = supabaseAdmin.from('orders').select('*', { count: 'exact', head: true })
  let qCancelled = supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled')
  let qCompleted = supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed')
  let qRevenue   = supabaseAdmin.from('orders').select('total').neq('status', 'cancelled')
  if (from) { qTotal = qTotal.gte('created_at', from); qCancelled = qCancelled.gte('created_at', from); qCompleted = qCompleted.gte('created_at', from); qRevenue = qRevenue.gte('created_at', from) }
  if (to)   { qTotal = qTotal.lte('created_at', to);   qCancelled = qCancelled.lte('created_at', to);   qCompleted = qCompleted.lte('created_at', to);   qRevenue = qRevenue.lte('created_at', to) }

  const [
    { count: total },
    { count: pending },
    { count: cancelled },
    { count: completed },
    { count: today },
    { data: revenueRows },
    { count: activeRes },
    { count: occupiedTab },
  ] = await Promise.all([
    qTotal,
    // pending always shows current state regardless of range
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    qCancelled,
    qCompleted,
    supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
    qRevenue,
    // reservations and tables are always current state — not filtered by date range
    supabaseAdmin.from('reservations').select('*', { count: 'exact', head: true }).in('status', ['pending', 'confirmed']),
    supabaseAdmin.from('tables').select('*', { count: 'exact', head: true }).eq('status', 'occupied'),
  ])

  const totalRevenue = (revenueRows ?? []).reduce((sum, r) => sum + Number(r.total), 0)
  const totalOrders = total ?? 0

  return {
    totalOrders,
    pendingOrders: pending ?? 0,
    cancelledOrders: cancelled ?? 0,
    completedOrders: completed ?? 0,
    todayOrders: today ?? 0,
    totalRevenue,
    avgTicket: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    activeReservations: activeRes ?? 0,
    occupiedTables: occupiedTab ?? 0,
  }
}

export async function getRevenueSeries(days: number, range?: DateRange): Promise<RevenueDataPoint[]> {
  let since: Date
  let until: Date

  if (range) {
    since = new Date(range.from); since.setHours(0, 0, 0, 0)
    until = new Date(range.to);   until.setHours(23, 59, 59, 999)
  } else {
    until = new Date()
    since = new Date(); since.setDate(since.getDate() - (days - 1)); since.setHours(0, 0, 0, 0)
  }

  const { data } = await supabaseAdmin
    .from('orders')
    .select('total, created_at')
    .gte('created_at', since.toISOString())
    .lte('created_at', until.toISOString())
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
  const cur = new Date(since)
  while (cur <= until) {
    const key = cur.toISOString().split('T')[0]
    const label = `${cur.getDate()}/${cur.getMonth() + 1}`
    result.push({ date: key, label, ...(byDay.get(key) ?? { revenue: 0, orders: 0 }) })
    cur.setDate(cur.getDate() + 1)
  }

  return result
}

export async function getOrdersByType(range?: DateRange): Promise<OrderTypeData> {
  const { from, to } = toISORange(range)

  let qMenu  = supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('order_type', 'menu')
  let qStore = supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('order_type', 'store')
  if (from) { qMenu = qMenu.gte('created_at', from); qStore = qStore.gte('created_at', from) }
  if (to)   { qMenu = qMenu.lte('created_at', to);   qStore = qStore.lte('created_at', to) }

  const [{ count: menu }, { count: store }] = await Promise.all([qMenu, qStore])
  return { menu: menu ?? 0, store: store ?? 0 }
}

export async function getTopProducts(limit: number, range?: DateRange): Promise<TopProductData[]> {
  const { from, to } = toISORange(range)

  // Resolve order IDs within range first (when filtering)
  let orderIds: string[] | null = null
  if (from || to) {
    let q = supabaseAdmin.from('orders').select('id').neq('status', 'cancelled')
    if (from) q = q.gte('created_at', from)
    if (to)   q = q.lte('created_at', to)
    const { data: ords } = await q
    orderIds = (ords ?? []).map(o => o.id)
    if (orderIds.length === 0) return []
  }

  let itemQuery = supabaseAdmin
    .from('order_items')
    .select('product_id, quantity, subtotal, products(name, category)')
  if (orderIds !== null) itemQuery = itemQuery.in('order_id', orderIds)

  const { data } = await itemQuery

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

export async function getRecentOrders(limit: number, range?: DateRange): Promise<OrderRow[]> {
  const { from, to } = toISORange(range)
  let q = supabaseAdmin
    .from('orders')
    .select('id, status, order_type, total, notes, created_at, customers(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (from) q = q.gte('created_at', from)
  if (to)   q = q.lte('created_at', to)
  const { data } = await q

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

// ── Weekly totals ─────────────────────────────────────────────────────────────

export interface WeeklyTotalData {
  label: string
  revenue: number
  orders: number
}

export async function getWeeklyTotals(weeks = 8, range?: DateRange): Promise<WeeklyTotalData[]> {
  let since: Date
  let until: Date

  if (range) {
    since = new Date(range.from); since.setHours(0, 0, 0, 0)
    until = new Date(range.to);   until.setHours(23, 59, 59, 999)
  } else {
    until = new Date()
    since = new Date(); since.setDate(since.getDate() - weeks * 7); since.setHours(0, 0, 0, 0)
  }

  const { data } = await supabaseAdmin
    .from('orders')
    .select('total, created_at')
    .gte('created_at', since.toISOString())
    .lte('created_at', until.toISOString())
    .neq('status', 'cancelled')

  const byWeek = new Map<string, { revenue: number; orders: number }>()

  ;(data ?? []).forEach(row => {
    const d = new Date(row.created_at)
    const day = d.getDay() || 7
    const monday = new Date(d)
    monday.setDate(d.getDate() - (day - 1))
    monday.setHours(0, 0, 0, 0)
    const key = monday.toISOString().split('T')[0]
    const cur = byWeek.get(key) ?? { revenue: 0, orders: 0 }
    cur.revenue += Number(row.total)
    cur.orders += 1
    byWeek.set(key, cur)
  })

  return Array.from(byWeek.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateStr, vals]) => {
      const d = new Date(dateStr)
      const label = `${d.getDate()}/${d.getMonth() + 1}`
      return { label, ...vals }
    })
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

export async function getPeakHours(range?: DateRange): Promise<PeakHourData[]> {
  const { from, to } = toISORange(range)
  let q = supabaseAdmin.from('orders').select('created_at').neq('status', 'cancelled')
  if (from) q = q.gte('created_at', from)
  if (to)   q = q.lte('created_at', to)
  const { data } = await q

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
