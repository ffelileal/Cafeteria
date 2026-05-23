'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { OrderStatus, OrderType } from '@/types/database'

const STATUS_TABS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'ready', label: 'Listo' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
]

const TYPE_TABS: { value: OrderType | 'all'; label: string; activeClass: string }[] = [
  { value: 'all', label: 'Todos', activeClass: 'border-border bg-muted/40 text-foreground' },
  { value: 'menu', label: 'Menú', activeClass: 'border-primary/30 bg-primary/10 text-primary' },
  { value: 'store', label: 'Tienda', activeClass: 'border-violet-500/30 bg-violet-500/10 text-violet-400' },
]

interface OrdersFiltersProps {
  currentStatus: OrderStatus | 'all'
  currentType: OrderType | 'all'
  currentSearch: string
}

const SearchIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const XIcon = () => (
  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export function OrdersFilters({ currentStatus, currentType, currentSearch }: OrdersFiltersProps) {
  const router = useRouter()
  const [search, setSearch] = useState(currentSearch)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(window.location.search)
    for (const [key, value] of Object.entries(updates)) {
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }
    params.delete('page')
    router.push(`/admin/orders?${params.toString()}`)
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setSearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateParams({ q: val })
    }, 400)
  }

  function clearSearch() {
    setSearch('')
    updateParams({ q: '' })
  }

  return (
    <div className="space-y-3">
      {/* Status tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => updateParams({ status: tab.value })}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
              currentStatus === tab.value
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border/50 bg-card/40 text-muted-foreground hover:border-border hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Type filter + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {TYPE_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => updateParams({ type: tab.value })}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs transition-colors',
                currentType === tab.value
                  ? tab.activeClass
                  : 'border-border/50 bg-card/40 text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Buscar cliente..."
            className="h-8 w-56 rounded-lg border border-border/50 bg-card/40 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
              aria-label="Limpiar búsqueda"
            >
              <XIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
