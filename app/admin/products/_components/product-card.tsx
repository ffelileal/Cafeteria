'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { toggleProductActiveAction } from '../actions'
import type { ProductRow, ProductCategory } from '@/types/database'

// ── Category metadata ─────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  espresso: 'Espresso',
  filter: 'Filter',
  beans: 'Granos',
  merchandise: 'Merchandise',
  pastries: 'Pastelería',
  'cold-brew': 'Cold Brew',
  special: 'Especial',
}

const CATEGORY_STYLES: Record<ProductCategory, string> = {
  espresso: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  filter: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  beans: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  merchandise: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  pastries: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'cold-brew': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  special: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const EditIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
  </svg>
)

const TrashIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
)

const ImagePlaceholder = () => (
  <div className="flex h-full w-full items-center justify-center bg-muted/20">
    <svg className="h-8 w-8 text-muted-foreground/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21,15 16,10 5,21" />
    </svg>
  </div>
)

// ── Toggle ────────────────────────────────────────────────────────────────────

function ActiveToggle({ productId, initial }: { productId: string; initial: boolean }) {
  const [isActive, setIsActive] = useState(initial)
  const [isPending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    const next = !isActive
    setIsActive(next)
    startTransition(async () => {
      const result = await toggleProductActiveAction(productId, next)
      if (result.error) setIsActive(!next) // revert on error
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={isActive ? 'Desactivar producto' : 'Activar producto'}
      className={cn(
        'relative h-5 w-9 rounded-full border transition-colors duration-200 disabled:opacity-50',
        isActive
          ? 'border-primary/40 bg-primary/20'
          : 'border-border bg-muted/30'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200',
          isActive
            ? 'left-[18px] bg-primary'
            : 'left-0.5 bg-muted-foreground/40'
        )}
      />
    </button>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: ProductRow
  onEdit: () => void
  onDelete: () => void
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/40 transition-colors hover:border-border">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/10">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <ImagePlaceholder />
        )}

        {/* Action buttons — visible on hover */}
        <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            onClick={onEdit}
            aria-label="Editar producto"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
          >
            <EditIcon />
          </button>
          <button
            onClick={onDelete}
            aria-label="Eliminar producto"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-destructive shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Name + category */}
        <div>
          <p className="truncate font-serif text-sm font-light text-foreground">{product.name}</p>
          <span
            className={cn(
              'mt-1.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider',
              CATEGORY_STYLES[product.category as ProductCategory]
            )}
          >
            {CATEGORY_LABELS[product.category as ProductCategory] ?? product.category}
          </span>
        </div>

        {/* Price + stock */}
        <div className="flex items-end justify-between">
          <p className="font-serif text-lg font-light text-foreground">
            ${Number(product.price).toLocaleString('es-AR')}
          </p>
          <p className="text-xs text-muted-foreground">
            {product.stock} en stock
          </p>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between border-t border-border/30 pt-3">
          <span className="text-xs text-muted-foreground">
            {product.is_active ? 'Activo' : 'Inactivo'}
          </span>
          <ActiveToggle productId={product.id} initial={product.is_active} />
        </div>
      </div>
    </div>
  )
}
