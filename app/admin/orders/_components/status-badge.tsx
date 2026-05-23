import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/database'

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

export const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  preparing: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  ready: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  completed: 'bg-muted/60 text-muted-foreground border-border',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider',
        STATUS_STYLES[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
