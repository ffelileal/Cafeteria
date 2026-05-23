'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { updateOrderStatusAction } from '@/app/admin/actions'
import { STATUS_LABELS, STATUS_STYLES } from './status-badge'
import { ORDERS_PAGE_SIZE } from '@/lib/admin/constants'
import type { OrderDetail } from '@/lib/admin/queries'
import type { OrderStatus } from '@/types/database'

const ALL_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled',
]

// ── Icons ─────────────────────────────────────────────────────────────────────

const ChevronIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

// ── Status Select ─────────────────────────────────────────────────────────────

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
    <div className="relative inline-block">
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-opacity',
          STATUS_STYLES[current],
          isPending && 'opacity-50'
        )}
      >
        {isPending && (
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
        )}
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
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
    </div>
  )
}

// ── Expanded detail row ───────────────────────────────────────────────────────

function ExpandedRow({ order }: { order: OrderDetail }) {
  return (
    <tr>
      <td colSpan={8} className="bg-muted/[0.04] px-4 pb-5 pt-1">
        <div className="ml-[52px] border-l border-border/30 pl-5">
          {order.items.length > 0 ? (
            <div className="mt-2 space-y-2">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-foreground">
                    <span className="mr-1.5 tabular-nums text-muted-foreground">{item.quantity}×</span>
                    {item.product_name ?? <span className="italic text-muted-foreground/60">Producto eliminado</span>}
                  </span>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>${Number(item.unit_price).toLocaleString('es-AR')} c/u</span>
                    <span className="w-20 text-right font-medium text-foreground">
                      ${Number(item.subtotal).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-end border-t border-border/30 pt-2">
                <span className="text-xs font-medium text-foreground">
                  Total: ${order.total.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">Sin ítems registrados.</p>
          )}

          {order.notes && (
            <div className="mt-3 inline-flex items-start gap-2 rounded-lg bg-muted/20 px-3 py-2 text-xs">
              <span className="mt-px shrink-0 font-medium text-foreground/50">Nota</span>
              <span className="text-muted-foreground">{order.notes}</span>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {order.payment_method && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 px-2.5 py-1 text-[10px] text-muted-foreground">
                {order.payment_method === 'cash' && 'Efectivo'}
                {order.payment_method === 'transfer' && 'Transferencia'}
                {order.payment_method === 'mercadopago' && 'MercadoPago'}
              </span>
            )}
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium',
                order.payment_status === 'paid'
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                  : order.payment_status === 'refunded'
                  ? 'border-red-500/20 bg-red-500/10 text-red-400'
                  : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
              )}
            >
              {order.payment_status === 'paid' && 'Pagado'}
              {order.payment_status === 'refunded' && 'Reembolsado'}
              {order.payment_status === 'pending' && 'Pago pendiente'}
            </span>
          </div>
        </div>
      </td>
    </tr>
  )
}

// ── Order table row ───────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function OrderTableRow({ order }: { order: OrderDetail }) {
  const [expanded, setExpanded] = useState(false)
  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0)

  return (
    <>
      <tr
        className={cn(
          'group cursor-pointer transition-colors hover:bg-muted/20',
          expanded && 'bg-muted/10 hover:bg-muted/10'
        )}
        onClick={() => setExpanded(v => !v)}
      >
        {/* # */}
        <td className="px-4 py-3">
          <span className="font-mono text-xs text-muted-foreground">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
        </td>

        {/* Cliente */}
        <td className="px-4 py-3">
          <p className="font-medium text-foreground">
            {order.customer?.full_name ?? <span className="text-muted-foreground">—</span>}
          </p>
          {order.customer?.email && (
            <p className="text-xs text-muted-foreground">{order.customer.email}</p>
          )}
        </td>

        {/* Canal */}
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

        {/* Ítems */}
        <td className="px-4 py-3 text-xs text-muted-foreground">
          {totalItems > 0 ? `${totalItems} ítem${totalItems !== 1 ? 's' : ''}` : '—'}
        </td>

        {/* Total */}
        <td className="px-4 py-3">
          <span className="font-serif font-medium text-foreground">
            ${order.total.toLocaleString('es-AR')}
          </span>
        </td>

        {/* Estado — stopPropagation so clicking the select doesn't toggle expand */}
        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
          <StatusSelect orderId={order.id} current={order.status} />
        </td>

        {/* Fecha */}
        <td className="px-4 py-3 text-xs text-muted-foreground" suppressHydrationWarning>
          {formatDate(order.created_at)}
        </td>

        {/* Chevron */}
        <td className="px-4 py-3">
          <ChevronIcon
            className={cn(
              'h-3.5 w-3.5 text-muted-foreground/40 transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
        </td>
      </tr>

      {expanded && <ExpandedRow order={order} />}
    </>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ page, pages, total }: { page: number; pages: number; total: number }) {
  const router = useRouter()

  function goTo(p: number) {
    const params = new URLSearchParams(window.location.search)
    params.set('page', String(p))
    router.push(`/admin/orders?${params.toString()}`)
  }

  const from = (page - 1) * ORDERS_PAGE_SIZE + 1
  const to = Math.min(page * ORDERS_PAGE_SIZE, total)

  return (
    <div className="flex items-center justify-between border-t border-border/40 px-4 py-3">
      <p className="text-xs text-muted-foreground">
        {total === 0 ? 'Sin resultados' : `${from}–${to} de ${total} pedidos`}
      </p>
      {pages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            ← Anterior
          </button>
          <span className="px-2 text-xs text-muted-foreground">
            {page} / {pages}
          </span>
          <button
            onClick={() => goTo(page + 1)}
            disabled={page >= pages}
            className="rounded-lg border border-border/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

interface OrdersDataTableProps {
  orders: OrderDetail[]
  total: number
  page: number
  pages: number
}

const HEADERS = ['Pedido', 'Cliente', 'Canal', 'Ítems', 'Total', 'Estado', 'Fecha', '']

export function OrdersDataTable({ orders, total, page, pages }: OrdersDataTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/40 py-20">
        <p className="text-sm text-muted-foreground">No se encontraron pedidos.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card/40">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/20">
              {HEADERS.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {orders.map(order => (
              <OrderTableRow key={order.id} order={order} />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pages={pages} total={total} />
    </div>
  )
}
