'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { WeeklyTotalData } from '@/lib/admin/queries'

const PRIMARY = '#c4943e'
const GRID = 'rgba(255,255,255,0.05)'
const MUTED = '#6b7280'
const TOOLTIP_BG = '#1c1917'

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number; name: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{ background: TOOLTIP_BG, border: '1px solid rgba(255,255,255,0.08)' }}
      className="rounded-xl px-4 py-3 shadow-xl"
    >
      <p className="mb-1 text-[11px] text-muted-foreground">Semana del {label}</p>
      <p className="font-serif text-base text-foreground">
        ${Math.round(payload[0]?.value ?? 0).toLocaleString('es-AR')}
      </p>
      {payload[1] && (
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {payload[1].value} pedidos
        </p>
      )}
    </div>
  )
}

interface WeeklyChartProps {
  data: WeeklyTotalData[]
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const hasData = data.some(d => d.revenue > 0)
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = data.reduce((s, d) => s + d.orders, 0)

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Comparativo semanal</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Últimas {data.length} semanas · excluye cancelados
          </p>
        </div>
        {hasData && (
          <div className="text-right">
            <p className="font-serif text-lg font-light text-primary">
              ${Math.round(totalRevenue).toLocaleString('es-AR')}
            </p>
            <p className="text-[11px] text-muted-foreground">{totalOrders} pedidos</p>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="flex h-[220px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }} barSize={28}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: MUTED }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: MUTED }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `$${((v as number) / 1000).toFixed(0)}K`}
              width={52}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.04)', radius: 4 }}
            />
            <Bar
              dataKey="revenue"
              name="Ingresos"
              fill={PRIMARY}
              fillOpacity={0.85}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
