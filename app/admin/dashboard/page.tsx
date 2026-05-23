import {
  getDashboardStats,
  getRevenueSeries,
  getOrdersByType,
  getTopProducts,
  getRecentOrders,
  getPeakHours,
  getWeeklyTotals,
  type DateRange,
} from '@/lib/admin/queries'
import { RevenueChart } from './_components/revenue-chart'
import { OrdersTypeChart } from './_components/orders-type-chart'
import { OrdersTable } from './_components/orders-table'
import { PeakHoursChart } from './_components/peak-hours-chart'
import { TopProductsRanking } from './_components/top-products-ranking'
import { WeeklyChart } from './_components/weekly-chart'
import { ExportButton } from './_components/export-button'
import { DateRangePicker } from './_components/date-range-picker'
import { RealtimeRefresher } from '../_components/realtime-refresher'
import { cn } from '@/lib/utils'

// ── KPI card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  sub: string
  accent?: boolean
  variant?: 'default' | 'danger' | 'success' | 'warning'
}

function KpiCard({ label, value, sub, accent, variant = 'default' }: KpiCardProps) {
  const borderColor =
    variant === 'danger'  ? 'border-red-500/20 bg-red-500/5' :
    variant === 'success' ? 'border-emerald-500/20 bg-emerald-500/5' :
    variant === 'warning' ? 'border-amber-500/20 bg-amber-500/5' :
    accent                ? 'border-primary/20 bg-primary/5' :
                            'border-border/50 bg-card/40'

  const valueColor =
    variant === 'danger'  ? 'text-red-400' :
    variant === 'success' ? 'text-emerald-400' :
    variant === 'warning' ? 'text-amber-400' :
    accent                ? 'text-primary' :
                            'text-foreground'

  return (
    <div className={cn('rounded-2xl border p-6 transition-colors', borderColor)}>
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className={cn('mt-2 font-serif text-3xl font-light', valueColor)}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

// ── Pending alert ─────────────────────────────────────────────────────────────

function PendingAlert({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
      <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
      <p className="text-sm text-amber-400">
        <span className="font-medium">{count} pedido{count !== 1 ? 's' : ''}</span>
        {' '}pendiente{count !== 1 ? 's' : ''} esperando atención
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams
  const fromParam = typeof params.from === 'string' ? params.from : undefined
  const toParam   = typeof params.to   === 'string' ? params.to   : undefined

  const range: DateRange | undefined =
    fromParam && toParam ? { from: fromParam, to: toParam } : undefined

  const [
    stats,
    revenue,
    orderTypes,
    topProducts,
    orders,
    peakHours,
    weekly,
  ] = await Promise.all([
    getDashboardStats(range),
    getRevenueSeries(30, range),
    getOrdersByType(range),
    getTopProducts(10, range),
    getRecentOrders(15, range),
    getPeakHours(range),
    getWeeklyTotals(8, range),
  ])

  const now = new Date()
  const today = now.toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const currentMonth = now.toLocaleDateString('es-AR', { month: 'long' })

  return (
    <div className="px-6 py-8 lg:px-8 xl:px-10">

      {/* Realtime refresh — subscribes to orders, reservations, and tables */}
      <RealtimeRefresher tables={['orders', 'reservations', 'tables']} />

      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-light text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm capitalize text-muted-foreground" suppressHydrationWarning>
            {today}
          </p>
        </div>
        <ExportButton monthLabel={currentMonth} />
      </div>

      {/* Date range picker */}
      <div className="mb-6">
        <DateRangePicker currentFrom={fromParam} currentTo={toParam} />
        {range && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Mostrando datos del {range.from} – {range.to}
          </p>
        )}
      </div>

      {/* Pending alert */}
      <PendingAlert count={stats.pendingOrders} />

      {/* ── KPI cards ── */}
      <section aria-label="Métricas principales">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Ingresos"
            value={`$${Math.round(stats.totalRevenue).toLocaleString('es-AR')}`}
            sub={`${stats.totalOrders.toLocaleString('es-AR')} pedidos en el período`}
            accent
          />
          <KpiCard
            label="Pedidos hoy"
            value={stats.todayOrders.toLocaleString('es-AR')}
            sub="recibidos en el día de hoy"
            variant={stats.todayOrders > 0 ? 'success' : 'default'}
          />
          <KpiCard
            label="Reservas activas"
            value={stats.activeReservations.toLocaleString('es-AR')}
            sub="pendientes y confirmadas"
            variant={stats.activeReservations > 0 ? 'warning' : 'default'}
          />
          <KpiCard
            label="Mesas ocupadas"
            value={stats.occupiedTables.toLocaleString('es-AR')}
            sub="con estado ocupado ahora"
            variant={stats.occupiedTables > 0 ? 'danger' : 'default'}
          />
        </div>
      </section>

      {/* ── Revenue + Peak hours ── */}
      <section className="mt-6" aria-label="Ingresos y horarios">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart data={revenue} />
          </div>
          <div>
            <PeakHoursChart data={peakHours} />
          </div>
        </div>
      </section>

      {/* ── Ranking horizontal ── */}
      <section className="mt-6" aria-label="Ranking de productos">
        <TopProductsRanking products={topProducts} />
      </section>

      {/* ── Comparativo semanal + Canal ── */}
      <section className="mt-6" aria-label="Semanal y canales">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <WeeklyChart data={weekly} />
          </div>
          <div>
            <OrdersTypeChart data={orderTypes} />
          </div>
        </div>
      </section>

      {/* ── Pedidos recientes ── */}
      <section className="mt-6" aria-label="Pedidos recientes">
        <div className="rounded-2xl border border-border/50 bg-card/40">
          <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
            <h3 className="text-sm font-medium text-foreground">Pedidos recientes</h3>
            <span className="text-xs text-muted-foreground">Últimos {orders.length}</span>
          </div>
          <OrdersTable orders={orders} />
        </div>
      </section>

    </div>
  )
}
