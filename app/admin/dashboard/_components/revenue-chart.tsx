'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { RevenueDataPoint } from '@/lib/admin/queries'

const PRIMARY = '#c4943e'
const GRID = 'rgba(255,255,255,0.05)'
const MUTED = '#6b7280'
const TOOLTIP_BG = '#1c1917'

interface RevenueChartProps {
  data: RevenueDataPoint[]
}

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
      <p className="mb-1 text-[11px] text-muted-foreground">{label}</p>
      <p className="font-serif text-base text-foreground">
        ${Number(payload[0]?.value ?? 0).toLocaleString('es-AR')}
      </p>
      {payload[1] && (
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {payload[1].value} pedidos
        </p>
      )}
    </div>
  )
}

export function RevenueChart({ data }: RevenueChartProps) {
  const hasData = data.some(d => d.revenue > 0)

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Ingresos</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Últimos 30 días · excluye cancelados</p>
        </div>
        {hasData && (
          <p className="font-serif text-lg font-light text-primary">
            ${data.reduce((s, d) => s + d.revenue, 0).toLocaleString('es-AR')}
          </p>
        )}
      </div>

      {!hasData ? (
        <div className="flex h-[220px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Sin datos de ingresos todavía.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.25} />
                <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: MUTED }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 10, fill: MUTED }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `$${(v as number).toLocaleString('es-AR')}`}
              width={72}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Ingresos"
              stroke={PRIMARY}
              strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 4, fill: PRIMARY, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
