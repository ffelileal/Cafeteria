'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ProductCard, CATEGORY_LABELS } from './product-card'
import { ProductDrawer, type DrawerMode } from './product-drawer'
import { DeleteDialog } from './delete-dialog'
import type { ProductRow, ProductCategory } from '@/types/database'

// ── Filter tabs ───────────────────────────────────────────────────────────────

type CategoryFilter = ProductCategory | 'all'
type ActiveFilter = 'all' | 'active' | 'inactive'

const CATEGORY_FILTER_TABS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'espresso', label: 'Espresso' },
  { value: 'filter', label: 'Filter' },
  { value: 'beans', label: 'Granos' },
  { value: 'merchandise', label: 'Merchandise' },
  { value: 'pastries', label: 'Pastelería' },
  { value: 'cold-brew', label: 'Cold Brew' },
  { value: 'special', label: 'Especial' },
]

// ── Icons ─────────────────────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

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

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ hasFilters, onNew }: { hasFilters: boolean; onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/50 py-20 text-center">
      <svg className="h-10 w-10 text-muted-foreground/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Zm-9 4V22M3.3 7l8.7 5 8.7-5" />
      </svg>
      <div>
        <p className="text-sm text-muted-foreground">
          {hasFilters ? 'No se encontraron productos.' : 'Todavía no hay productos.'}
        </p>
        {!hasFilters && (
          <button
            onClick={onNew}
            className="mt-2 text-sm text-primary underline-offset-4 hover:underline"
          >
            Crear el primero
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main shell ────────────────────────────────────────────────────────────────

interface DrawerState {
  mode: DrawerMode
  product?: ProductRow
}

interface ProductsShellProps {
  products: ProductRow[]
}

export function ProductsShell({ products }: ProductsShellProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [drawer, setDrawer] = useState<DrawerState | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null)

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return products.filter(p => {
      if (term && !p.name.toLowerCase().includes(term) && !p.description.toLowerCase().includes(term)) return false
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false
      if (activeFilter === 'active' && !p.is_active) return false
      if (activeFilter === 'inactive' && p.is_active) return false
      return true
    })
  }, [products, search, categoryFilter, activeFilter])

  function handleMutationDone() {
    router.refresh()
    setDrawer(null)
    setDeleteTarget(null)
  }

  const hasFilters = !!search || categoryFilter !== 'all' || activeFilter !== 'all'

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light text-foreground">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} de {products.length} producto{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setDrawer({ mode: 'create' })}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <PlusIcon />
          Nuevo producto
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {CATEGORY_FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setCategoryFilter(tab.value)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                categoryFilter === tab.value
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border/50 bg-card/40 text-muted-foreground hover:border-border hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active filter + Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1.5">
            {(['all', 'active', 'inactive'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs transition-colors',
                  activeFilter === f
                    ? f === 'active'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : f === 'inactive'
                      ? 'border-muted-foreground/20 bg-muted/30 text-muted-foreground'
                      : 'border-border bg-muted/40 text-foreground'
                    : 'border-border/50 bg-card/40 text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Inactivos'}
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
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="h-8 w-52 rounded-lg border border-border/50 bg-card/40 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
                aria-label="Limpiar búsqueda"
              >
                <XIcon />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            onNew={() => setDrawer({ mode: 'create' })}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => setDrawer({ mode: 'edit', product })}
                onDelete={() => setDeleteTarget(product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawer && (
        <ProductDrawer
          mode={drawer.mode}
          product={drawer.product}
          onClose={() => setDrawer(null)}
          onSaved={handleMutationDone}
        />
      )}

      {/* Delete dialog */}
      {deleteTarget && (
        <DeleteDialog
          product={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onDeleted={handleMutationDone}
        />
      )}
    </>
  )
}
