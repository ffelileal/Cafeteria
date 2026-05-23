import { cn } from '@/lib/utils'
import type { TopProductData } from '@/lib/admin/queries'

const CATEGORY_LABELS: Record<string, string> = {
  espresso: 'Espresso',
  filter: 'Filter',
  beans: 'Granos',
  merchandise: 'Merchandise',
  pastries: 'Pastelería',
  'cold-brew': 'Cold Brew',
  special: 'Especial',
}

interface TopProductsProps {
  products: TopProductData[]
}

export function TopProducts({ products }: TopProductsProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/40 p-6">
        <h3 className="mb-4 text-sm font-medium text-foreground">Más vendidos</h3>
        <div className="flex h-32 items-center justify-center">
          <p className="text-sm text-muted-foreground">Sin datos de ventas todavía.</p>
        </div>
      </div>
    )
  }

  const max = Math.max(...products.map(p => p.quantity), 1)

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Más vendidos</h3>
        <span className="text-xs text-muted-foreground">por unidades</span>
      </div>

      <ul className="space-y-4">
        {products.map((product, i) => {
          const pct = Math.round((product.quantity / max) * 100)
          return (
            <li key={product.name}>
              <div className="mb-1.5 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="w-4 shrink-0 text-right text-[10px] font-medium text-muted-foreground/50">
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                      {CATEGORY_LABELS[product.category] ?? product.category}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-foreground">{product.quantity}</p>
                  <p className="text-[10px] text-muted-foreground">
                    ${product.revenue.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted/30">
                <div
                  className={cn('h-full rounded-full bg-primary transition-all duration-700')}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
