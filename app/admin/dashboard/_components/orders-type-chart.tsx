'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { OrderTypeData } from '@/lib/admin/queries'

const COLORS = { menu: '#c4943e', store: '#8b5cf6' }
const TOOLTIP_BG = '#1c1917'

interface OrdersTypeChartProps {
  data: OrderTypeData
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { name: string; value: number }[]
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{ background: TOOLTIP_BG, border: '1px solid rgba(255,255,255,0.08)' }}
      className="rounded-xl px-4 py-3 shadow-xl"
    >
      <p className="text-[11px] text-muted-foreground">{payload[0]?.name}</p>
      <p className="font-serif text-base text-foreground">{payload[0]?.value} pedidos</p>
    </div>
  )
}

function LegendDot({ color, label, value, pct }: { color: string; label: string; value: number; pct: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-right">
        <span className="text-sm font-medium text-foreground">{value}</span>
        <span className="ml-1 text-[10px] text-muted-foreground/60">{pct}%</span>
      </div>
    </div>
  )
}

export function OrdersTypeChart({ data }: OrdersTypeChartProps) {
  const total = data.menu + data.store
  const menuPct = total > 0 ? Math.round((data.menu / total) * 100) : 0
  const storePct = total > 0 ? 100 - menuPct : 0

  const chartData = [
    { name: 'Menú', value: data.menu },
    { name: 'Tienda', value: data.store },
  ]

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-6">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">Pedidos por canal</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{total} en total</p>
      </div>

      {total === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-sm text-muted-foreground">Sin pedidos todavía.</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? COLORS.menu : COLORS.store} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2 border-t border-border/40 pt-4">
            <LegendDot color={COLORS.menu} label="Menú" value={data.menu} pct={menuPct} />
            <LegendDot color={COLORS.store} label="Tienda" value={data.store} pct={storePct} />
          </div>
        </>
      )}
    </div>
  )
}
