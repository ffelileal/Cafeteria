'use client'

import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import { updateOrderStatusAction } from '@/app/admin/actions'
import type { OrderStatus } from '@/types/database'

export interface OrderRow {
  id: string
  status: OrderStatus
  order_type: 'menu' | 'store'
  total: number
  notes: string | null
  created_at: string
  table_number: number | null
  table_slug: string | null
  customers: { full_name: string; email: string } | null
}

interface OrdersTableProps {
  orders: OrderRow[]
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

const STATUS_CHIP: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  preparing: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  ready: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  completed: 'bg-muted/60 text-muted-foreground border-border',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const ALL_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled',
]

function StatusSelect({ orderId, current }: { orderId: string; current: OrderStatus }) {
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as OrderStatus
    if (next === current) return

    startTransition(async () => {
      await updateOrderStatusAction(orderId, next)
    })
  }

  return (
    <div className="relative">
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider',
          STATUS_CHIP[current],
          isPending && 'opacity-50'
        )}
      >
        {isPending && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
        {STATUS_LABELS[current]}
      </span>
      <select
        value={current}
        onChange={handleChange}
        disabled={isPending}
        aria-label="Cambiar estado"
        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
      >
        {ALL_STATUSES.map(s => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  )
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function OrdersTable({ orders }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/50 py-16 text-center">
        <p className="text-sm text-muted-foreground">No hay pedidos todavía.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-muted/30">
            {['Pedido', 'Cliente', 'Tipo', 'Total', 'Estado', 'Fecha'].map(h => (
              <th
                key={h}
                className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {orders.map(order => (
            <tr
              key={order.id}
              className="group transition-colors hover:bg-muted/20"
            >
              {/* ID */}
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-muted-foreground">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
              </td>

              {/* Cliente */}
              <td className="px-4 py-3">
                <p className="font-medium text-foreground">
                  {order.customers?.full_name ?? '—'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.customers?.email ?? ''}
                </p>
              </td>

              {/* Tipo */}
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider',
                    order.order_type === 'menu'
                      ? 'border-primary/20 bg-primary/10 text-primary'
                      : 'border-violet-500/20 bg-violet-500/10 text-violet-400'
                  )}
                >
                  {order.order_type === 'menu' ? 'Menú' : 'Tienda'}
                </span>
                {order.table_number != null && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Mesa {order.table_number}
                  </p>
                )}
              </td>

              {/* Total */}
              <td className="px-4 py-3">
                <span className="font-serif font-medium text-foreground">
                  ${Number(order.total).toLocaleString('es-AR')}
                </span>
              </td>

              {/* Estado */}
              <td className="px-4 py-3">
                <StatusSelect orderId={order.id} current={order.status} />
              </td>

              {/* Fecha */}
              <td className="px-4 py-3 text-xs text-muted-foreground" suppressHydrationWarning>
                {formatDate(order.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
