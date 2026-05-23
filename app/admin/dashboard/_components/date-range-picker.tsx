'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  currentFrom?: string
  currentTo?: string
}

type Preset = {
  label: string
  from: string
  to: string
}

function getPresets(): Preset[] {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const today = fmt(now)

  const d7 = new Date(now)
  d7.setDate(d7.getDate() - 6)

  const d30 = new Date(now)
  d30.setDate(d30.getDate() - 29)

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  return [
    { label: 'Hoy',       from: today,       to: today },
    { label: '7 días',    from: fmt(d7),     to: today },
    { label: '30 días',   from: fmt(d30),    to: today },
    { label: 'Este mes',  from: fmt(monthStart), to: today },
    { label: 'Todo',      from: '',          to: '' },
  ]
}

export function DateRangePicker({ currentFrom, currentTo }: DateRangePickerProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navigate = useCallback(
    (from: string, to: string) => {
      const params = new URLSearchParams(
        typeof window !== 'undefined' ? window.location.search : ''
      )
      if (from) params.set('from', from)
      else params.delete('from')
      if (to) params.set('to', to)
      else params.delete('to')
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname]
  )

  const presets = getPresets()

  const activePreset = presets.find(p => p.from === (currentFrom ?? '') && p.to === (currentTo ?? ''))

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset pills */}
      <div className="flex gap-1 rounded-xl border border-border/50 bg-muted/20 p-0.5">
        {presets.map(p => (
          <button
            key={p.label}
            onClick={() => navigate(p.from, p.to)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors',
              activePreset?.label === p.label
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date inputs */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground">De</span>
        <input
          type="date"
          defaultValue={currentFrom ?? ''}
          onBlur={e => navigate(e.target.value, currentTo ?? '')}
          className="rounded-lg border border-border/50 bg-card/40 px-2.5 py-1.5 text-[11px] text-foreground outline-none focus:border-primary/40 focus:ring-0"
        />
        <span className="text-[11px] text-muted-foreground">Hasta</span>
        <input
          type="date"
          defaultValue={currentTo ?? ''}
          onBlur={e => navigate(currentFrom ?? '', e.target.value)}
          className="rounded-lg border border-border/50 bg-card/40 px-2.5 py-1.5 text-[11px] text-foreground outline-none focus:border-primary/40 focus:ring-0"
        />
      </div>
    </div>
  )
}
