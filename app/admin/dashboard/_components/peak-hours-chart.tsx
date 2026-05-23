'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { PeakHourData } from '@/lib/admin/queries'

const PRIMARY = '#c4943e'
const BAR_MUTED = 'rgba(255,255,255,0.06)'
const MUTED_TEXT = '#6b7280'
const TOOLTIP_BG = '#1c1917'

interface PeakHoursChartProps {
  data: PeakHourData[]
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{ background: TOOLTIP_BG, border: '1px solid rgba(255,255,255,0.08)' }}
      className="rounded-xl px-3.5 py-2.5 shadow-xl"
    >
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-serif text-base text-foreground">
        {payload[0]?.value} pedido{payload[0]?.value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

export function PeakHoursChart({ data }: PeakHoursChartProps) {
  const total = data.reduce((s, d) => s + d.orders, 0)
  const maxOrders = Math.max(...data.map(d => d.orders), 1)
  const peakEntry = data.reduce(
    (best, d) => (d.orders > best.orders ? d : best),
    data[0] ?? { hour: 0, label: '', orders: 0 }
  )

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Horarios pico</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {total > 0 ? `${total} pedidos registrados` : 'Sin datos todavía'}
          </p>
        </div>
        {total > 0 && (
          <div className="text-right">
            <p className="font-serif text-lg font-light text-primary">{peakEntry.label}</p>
            <p className="text-[10px] text-muted-foreground">hora pico</p>
          </div>
        )}
      </div>

      {total === 0 ? (
        <div className="flex h-[220px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Sin datos de pedidos todavía.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={12}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: MUTED_TEXT }}
              axisLine={false}
              tickLine={false}
              interval={1}
            />
            <YAxis
              tick={{ fontSize: 9, fill: MUTED_TEXT }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="orders" radius={[3, 3, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.orders === maxOrders && maxOrders > 0 ? PRIMARY : BAR_MUTED}
                  fillOpacity={entry.orders === maxOrders && maxOrders > 0 ? 1 : 0.9}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {total > 0 && (
        <div className="mt-3 flex items-center gap-2 border-t border-border/40 pt-3">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-[11px] text-muted-foreground">
            Hora pico: <span className="text-foreground">{peakEntry.label}</span> con{' '}
            <span className="text-foreground">{peakEntry.orders}</span> pedidos
          </span>
        </div>
      )}
    </div>
  )
}
