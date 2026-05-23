import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/ssr'
import { supabaseAdmin } from '@/lib/supabase/admin'

// ── Auth guard ────────────────────────────────────────────────────────────────

async function assertAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function fmtTime(iso: string) {
  // Argentina is UTC-3
  const utcHour = new Date(iso).getUTCHours()
  const utcMin = new Date(iso).getUTCMinutes()
  const localHour = (utcHour - 3 + 24) % 24
  return `${String(localHour).padStart(2, '0')}:${String(utcMin).padStart(2, '0')}`
}

function fmtPeso(n: number) {
  return `$${Math.round(n).toLocaleString('es-AR')}`
}

const STATUS_ES: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  ready: 'Listo',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

const TYPE_ES: Record<string, string> = {
  menu: 'Menú',
  store: 'Tienda',
}

const CATEGORY_ES: Record<string, string> = {
  espresso: 'Espresso',
  filter: 'Filter',
  beans: 'Granos',
  merchandise: 'Merchandise',
  pastries: 'Pastelería',
  'cold-brew': 'Cold Brew',
  special: 'Especial',
}

function setColWidths(ws: XLSX.WorkSheet, widths: number[]) {
  ws['!cols'] = widths.map(wch => ({ wch }))
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  if (!(await assertAdmin())) {
    return new NextResponse('No autorizado', { status: 401 })
  }

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const monthLabel = now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  const monthSlug = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // ── Fetch all data in parallel ──────────────────────────────────────────────

  const [
    { data: ordersRaw },
    { data: prevOrdersRaw },
    { data: orderItemsRaw },
    { data: allOrders },
  ] = await Promise.all([
    // Current month orders with customer
    supabaseAdmin
      .from('orders')
      .select('id, status, order_type, total, notes, created_at, customers(full_name, email)')
      .gte('created_at', monthStart.toISOString())
      .lt('created_at', monthEnd.toISOString())
      .order('created_at', { ascending: false }),

    // Previous month for comparison
    supabaseAdmin
      .from('orders')
      .select('total')
      .gte('created_at', new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString())
      .lt('created_at', monthStart.toISOString())
      .neq('status', 'cancelled'),

    // Order items this month (for product breakdown)
    supabaseAdmin
      .from('order_items')
      .select('quantity, subtotal, product_id, products(name, category), order_id')
      .in(
        'order_id',
        // placeholder — we'll re-filter after fetching
        ['00000000-0000-0000-0000-000000000000']
      ),

    // All time orders for peak hours (customer_id per order)
    supabaseAdmin
      .from('orders')
      .select('created_at, customer_id')
      .neq('status', 'cancelled'),
  ])

  // Re-fetch order items scoped to this month's order IDs
  const monthOrderIds = (ordersRaw ?? []).map(o => o.id)
  const { data: itemsRaw } = monthOrderIds.length > 0
    ? await supabaseAdmin
        .from('order_items')
        .select('quantity, subtotal, product_id, products(name, category), order_id')
        .in('order_id', monthOrderIds)
    : { data: [] }

  // ── Derived stats ───────────────────────────────────────────────────────────

  type RawCustomer = { full_name: string; email: string }
  type RawOrder = {
    id: string; status: string; order_type: string; total: number
    notes: string | null; created_at: string
    customers: RawCustomer | RawCustomer[] | null
  }

  const orders = (ordersRaw ?? []) as RawOrder[]
  const nonCancelled = orders.filter(o => o.status !== 'cancelled')

  const totalRevenue = nonCancelled.reduce((s, o) => s + Number(o.total), 0)
  const totalOrders = orders.length
  const avgTicket = nonCancelled.length > 0 ? totalRevenue / nonCancelled.length : 0
  const menuOrders = orders.filter(o => o.order_type === 'menu').length
  const storeOrders = orders.filter(o => o.order_type === 'store').length
  const prevRevenue = (prevOrdersRaw ?? []).reduce((s, r) => s + Number(r.total), 0)
  const revenueChange = prevRevenue > 0
    ? ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1)
    : 'N/A'

  // Unique + recurring customers (all time)
  const customerCounts = new Map<string, number>()
  ;(allOrders ?? []).forEach(r => {
    customerCounts.set(r.customer_id, (customerCounts.get(r.customer_id) ?? 0) + 1)
  })
  const uniqueCustomers = customerCounts.size
  const recurringCustomers = Array.from(customerCounts.values()).filter(n => n >= 2).length
  const recurringPct = uniqueCustomers > 0
    ? Math.round((recurringCustomers / uniqueCustomers) * 100) : 0

  // Daily aggregation (this month)
  const byDay = new Map<string, { pedidos: number; ingresos: number }>()
  nonCancelled.forEach(o => {
    const key = o.created_at.split('T')[0]
    const cur = byDay.get(key) ?? { pedidos: 0, ingresos: 0 }
    cur.pedidos++
    cur.ingresos += Number(o.total)
    byDay.set(key, cur)
  })

  // Product aggregation (this month)
  type RawProduct = { name: string; category: string }
  type RawItem = {
    quantity: number; subtotal: number; product_id: string
    products: RawProduct | RawProduct[] | null; order_id: string
  }
  const productMap = new Map<string, { name: string; category: string; units: number; revenue: number }>()
  ;((itemsRaw ?? []) as RawItem[]).forEach(item => {
    const prod = Array.isArray(item.products) ? item.products[0] : item.products
    if (!prod) return
    const cur = productMap.get(item.product_id) ?? { name: prod.name, category: prod.category, units: 0, revenue: 0 }
    cur.units += item.quantity
    cur.revenue += Number(item.subtotal)
    productMap.set(item.product_id, cur)
  })
  const topProducts = Array.from(productMap.values()).sort((a, b) => b.units - a.units)

  // Peak hours (this month, local Argentina time)
  const peakByHour = new Array(24).fill(0) as number[]
  nonCancelled.forEach(o => {
    const localHour = (new Date(o.created_at).getUTCHours() - 3 + 24) % 24
    peakByHour[localHour]++
  })

  // ── Sheet 1: Resumen ────────────────────────────────────────────────────────

  const resumenData: (string | number)[][] = [
    [`REPORTE MENSUAL — ${monthLabel.toUpperCase()}`],
    [],
    ['Período', `${fmtDate(monthStart.toISOString())} — ${fmtDate(new Date(monthEnd.getTime() - 1).toISOString())}`],
    [],
    ['FACTURACIÓN', ''],
    ['Ingresos del mes', fmtPeso(totalRevenue)],
    ['Mes anterior', fmtPeso(prevRevenue)],
    ['Variación vs mes anterior', revenueChange === 'N/A' ? 'N/A' : `${revenueChange}%`],
    [],
    ['PEDIDOS', ''],
    ['Total pedidos', totalOrders],
    ['No cancelados', nonCancelled.length],
    ['Ticket promedio', fmtPeso(avgTicket)],
    ['Pedidos de menú', menuOrders],
    ['Pedidos de tienda', storeOrders],
    [],
    ['CLIENTES', ''],
    ['Clientes únicos (total histórico)', uniqueCustomers],
    ['Clientes recurrentes (2+ pedidos)', recurringCustomers],
    ['% clientes recurrentes', `${recurringPct}%`],
  ]

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData)
  setColWidths(wsResumen, [30, 22])

  // ── Sheet 2: Pedidos del mes ────────────────────────────────────────────────

  const pedidosHeaders = ['Fecha', 'Hora', 'Cliente', 'Email', 'Canal', 'Estado', 'Total']
  const pedidosRows = orders.map(o => {
    const cust = Array.isArray(o.customers) ? o.customers[0] : o.customers
    return [
      fmtDate(o.created_at),
      fmtTime(o.created_at),
      cust?.full_name ?? '—',
      cust?.email ?? '—',
      TYPE_ES[o.order_type] ?? o.order_type,
      STATUS_ES[o.status] ?? o.status,
      Number(o.total),
    ]
  })

  const wsPedidos = XLSX.utils.aoa_to_sheet([pedidosHeaders, ...pedidosRows])
  setColWidths(wsPedidos, [12, 8, 24, 28, 8, 14, 12])

  // ── Sheet 3: Ventas por día ─────────────────────────────────────────────────

  const ventasHeaders = ['Fecha', 'Pedidos', 'Ingresos']
  const ventasRows = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => [fmtDate(`${date}T00:00:00`), d.pedidos, d.ingresos])

  const wsVentas = XLSX.utils.aoa_to_sheet([ventasHeaders, ...ventasRows])
  setColWidths(wsVentas, [14, 10, 14])

  // ── Sheet 4: Productos vendidos ─────────────────────────────────────────────

  const prodHeaders = ['Producto', 'Categoría', 'Unidades vendidas', 'Ingresos']
  const prodRows = topProducts.map(p => [
    p.name,
    CATEGORY_ES[p.category] ?? p.category,
    p.units,
    p.revenue,
  ])

  const wsProductos = XLSX.utils.aoa_to_sheet([prodHeaders, ...prodRows])
  setColWidths(wsProductos, [28, 16, 18, 14])

  // ── Sheet 5: Horarios pico ──────────────────────────────────────────────────

  const horariosHeaders = ['Hora', 'Pedidos']
  const horariosRows = peakByHour
    .map((count, h) => {
      const label = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`
      return [label, count]
    })
    .filter((_, h) => h >= 6 && h <= 22)

  const wsHorarios = XLSX.utils.aoa_to_sheet([horariosHeaders, ...horariosRows])
  setColWidths(wsHorarios, [10, 10])

  // ── Build workbook ──────────────────────────────────────────────────────────

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen')
  XLSX.utils.book_append_sheet(wb, wsPedidos, 'Pedidos')
  XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas por día')
  XLSX.utils.book_append_sheet(wb, wsProductos, 'Productos')
  XLSX.utils.book_append_sheet(wb, wsHorarios, 'Horarios pico')

  const buffer: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="reporte-${monthSlug}.xlsx"`,
    },
  })
}
