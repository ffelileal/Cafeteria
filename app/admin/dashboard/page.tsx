import {
  getDashboardStats,
  getRevenueSeries,
  getOrdersByType,
  getTopProducts,
  getRecentOrders,
  getDailyRevenue,
  getMonthlyComparison,
  getPeakHours,
  getRecurringCustomers,
} from '@/lib/admin/queries'
import { RevenueChart } from './_components/revenue-chart'
import { OrdersTypeChart } from './_components/orders-type-chart'
import { TopProducts } from './_components/top-products'
import { OrdersTable } from './_components/orders-table'
import { PeakHoursChart } from './_components/peak-hours-chart'
import { ExportButton } from './_components/export-button'
import { cn } from '@/lib/utils'

// ── Trend badge ───────────────────────────────────────────────────────────────

function TrendBadge({ pct, inverse = false }: { pct: number; inverse?: boolean }) {
  if (pct === 0) return <span className="text-[11px] text-muted-foreground/50">Sin cambio</span>
  const positive = inverse ? pct < 0 : pct > 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[11px] font-medium',
        positive ? 'text-emerald-400' : 'text-red-400'
      )}
    >
      {pct > 0 ? '↑' : '↓'} {Math.abs(pct)}% vs anterior
    </span>
  )
}

// ── KPI card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  sub: string
  trend?: number
  inverseTrend?: boolean
  accent?: boolean
}

function KpiCard({ label, value, sub, trend, inverseTrend = false, accent }: KpiCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-6 transition-colors',
        accent
          ? 'border-primary/20 bg-primary/5'
          : 'border-border/50 bg-card/40'
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-2 font-serif text-3xl font-light',
          accent ? 'text-primary' : 'text-foreground'
        )}
      >
        {value}
      </p>
      <div className="mt-1.5 flex flex-col gap-0.5">
        <p className="text-xs text-muted-foreground">{sub}</p>
        {trend !== undefined && <TrendBadge pct={trend} inverse={inverseTrend} />}
      </div>
    </div>
  )
}

// ── Pending alert strip ───────────────────────────────────────────────────────

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

export default async function DashboardPage() {
  const [
    stats,
    revenue,
    orderTypes,
    topProducts,
    orders,
    daily,
    monthly,
    peakHours,
    recurring,
  ] = await Promise.all([
    getDashboardStats(),
    getRevenueSeries(30),
    getOrdersByType(),
    getTopProducts(5),
    getRecentOrders(15),
    getDailyRevenue(),
    getMonthlyComparison(),
    getPeakHours(),
    getRecurringCustomers(),
  ])

  const now = new Date()
  const today = now.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const currentMonth = now.toLocaleDateString('es-AR', { month: 'long' })

  return (
    <div className="px-6 py-8 lg:px-8 xl:px-10">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-light text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm capitalize text-muted-foreground" suppressHydrationWarning>
            {today}
          </p>
        </div>
        <ExportButton monthLabel={currentMonth} />
      </div>

      {/* Pending alert */}
      <PendingAlert count={stats.pendingOrders} />

      {/* ── KPI cards ── */}
      <section aria-label="Métricas">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Ventas hoy"
            value={`$${Math.round(daily.today).toLocaleString('es-AR')}`}
            sub={`${daily.todayOrders} pedido${daily.todayOrders !== 1 ? 's' : ''} recibido${daily.todayOrders !== 1 ? 's' : ''}`}
            trend={daily.changePercent}
            accent={daily.today > 0}
          />
          <KpiCard
            label="Pedidos este mes"
            value={monthly.currentOrders.toLocaleString('es-AR')}
            sub={`$${Math.round(monthly.currentRevenue).toLocaleString('es-AR')} facturados`}
            trend={monthly.ordersChangePercent}
          />
          <KpiCard
            label="Ticket promedio"
            value={`$${Math.round(stats.avgTicket).toLocaleString('es-AR')}`}
            sub="promedio por pedido"
          />
          <KpiCard
            label="Clientes recurrentes"
            value={`${recurring.pct}%`}
            sub={`${recurring.recurring} de ${recurring.total} clientes`}
          />
        </div>
      </section>

      {/* ── Revenue chart + Peak hours ── */}
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

      {/* ── Top products + Channel + Total ── */}
      <section className="mt-6" aria-label="Productos y canales">
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <TopProducts products={topProducts} />
          </div>
          <div>
            <OrdersTypeChart data={orderTypes} />
          </div>
          {/* Totales acumulados */}
          <div className="rounded-2xl border border-border/50 bg-card/40 p-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Facturación total
            </p>
            <p className="mt-2 font-serif text-4xl font-light text-foreground">
              ${Math.round(stats.totalRevenue).toLocaleString('es-AR')}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.totalOrders.toLocaleString('es-AR')} pedidos en total
            </p>

            <div className="mt-5 space-y-3 border-t border-border/40 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Menú</span>
                <span className="font-medium text-foreground">{orderTypes.menu}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Tienda</span>
                <span className="font-medium text-foreground">{orderTypes.store}</span>
              </div>
              <div className="h-px bg-border/40" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Mes anterior</span>
                <span className="text-sm text-foreground">
                  ${Math.round(monthly.prevRevenue).toLocaleString('es-AR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Este mes</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">
                    ${Math.round(monthly.currentRevenue).toLocaleString('es-AR')}
                  </span>
                  {monthly.revenueChangePercent !== 0 && (
                    <span
                      className={cn(
                        'text-[10px] font-medium',
                        monthly.revenueChangePercent > 0 ? 'text-emerald-400' : 'text-red-400'
                      )}
                    >
                      {monthly.revenueChangePercent > 0 ? '+' : ''}
                      {monthly.revenueChangePercent}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Recent orders ── */}
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
