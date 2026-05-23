'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { TopProductData } from '@/lib/admin/queries'

const PRIMARY = '#c4943e'
const BAR_MUTED = 'rgba(196,148,62,0.12)'
const MUTED_TEXT = '#6b7280'
const TOOLTIP_BG = '#1c1917'

type Tab = 'quantity' | 'revenue'

const TABS: { key: Tab; label: string }[] = [
  { key: 'quantity', label: 'Top 10 Cantidad' },
  { key: 'revenue',  label: 'Top 10 Ventas' },
]

function CustomTooltip({
  active,
  payload,
  tab,
}: {
  active?: boolean
  payload?: { value: number }[]
  tab: Tab
}) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value ?? 0
  return (
    <div
      style={{ background: TOOLTIP_BG, border: '1px solid rgba(255,255,255,0.08)' }}
      className="rounded-xl px-4 py-3 shadow-xl"
    >
      <p className="font-serif text-base text-foreground">
        {tab === 'quantity'
          ? `${val} unidad${val !== 1 ? 'es' : ''}`
          : `$${Math.round(val).toLocaleString('es-AR')}`}
      </p>
    </div>
  )
}

interface TopProductsRankingProps {
  products: TopProductData[]
}

export function TopProductsRanking({ products }: TopProductsRankingProps) {
  const [tab, setTab] = useState<Tab>('quantity')

  const top10 = products.slice(0, 10)

  const data = [...top10]
    .sort((a, b) =>
      tab === 'quantity' ? b.quantity - a.quantity : b.revenue - a.revenue
    )
    .map(p => ({
      name: p.name.length > 22 ? p.name.slice(0, 22) + '…' : p.name,
      value: tab === 'quantity' ? p.quantity : p.revenue,
    }))

  const maxVal = Math.max(...data.map(d => d.value), 1)

  const chartHeight = Math.max(data.length * 42 + 20, 160)

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground">Ranking de productos</h3>
        <div className="flex gap-1 rounded-xl border border-border/50 bg-muted/20 p-0.5">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-[11px] font-medium transition-colors',
                tab === t.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-sm text-muted-foreground">Sin datos de ventas todavía.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
            barSize={14}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: MUTED_TEXT }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v =>
                tab === 'revenue'
                  ? `$${((v as number) / 1000).toFixed(0)}K`
                  : String(v)
              }
            />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={{ fontSize: 11, fill: MUTED_TEXT }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip tab={tab} />}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.value === maxVal ? PRIMARY : BAR_MUTED}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
