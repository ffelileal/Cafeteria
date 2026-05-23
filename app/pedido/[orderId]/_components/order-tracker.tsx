'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/database'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TrackedOrder {
  id: string
  status: OrderStatus
  total: number
  notes: string | null
  created_at: string
  table_number: number | null
  table_slug: string | null
  items: {
    id: string
    quantity: number
    unit_price: number
    subtotal: number
    product_name: string | null
  }[]
}

// ── Stepper config ────────────────────────────────────────────────────────────

const STEPS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'pending',   label: 'Recibido',   icon: '🧾' },
  { status: 'confirmed', label: 'Confirmado',  icon: '✅' },
  { status: 'preparing', label: 'Preparando',  icon: '☕' },
  { status: 'ready',     label: '¡Listo!',     icon: '🔔' },
  { status: 'completed', label: 'Entregado',   icon: '🎉' },
]
const STEP_KEYS = STEPS.map(s => s.status)

const STATUS_TOAST: Partial<Record<OrderStatus, string>> = {
  confirmed: 'Tu pedido fue confirmado.',
  preparing: 'Estamos preparándolo ahora.',
  ready: '¡Tu pedido está listo! Ya va a tu mesa.',
  completed: 'Pedido entregado. ¡Gracias!',
}

function getStepIndex(status: OrderStatus): number {
  const i = STEP_KEYS.indexOf(status)
  return i === -1 ? 0 : i
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OrderTracker({ order }: { order: TrackedOrder }) {
  const router = useRouter()
  const prevStatusRef = useRef<OrderStatus>(order.status)
  const isCancelled = order.status === 'cancelled'
  const isDone = order.status === 'completed' || isCancelled
  const currentStep = getStepIndex(order.status)

  // Poll every 8 s while order is active
  useEffect(() => {
    if (isDone) return
    const id = setInterval(() => router.refresh(), 8000)
    return () => clearInterval(id)
  }, [router, isDone])

  // Toast on status change
  useEffect(() => {
    const prev = prevStatusRef.current
    if (prev !== order.status) {
      prevStatusRef.current = order.status
      const msg = STATUS_TOAST[order.status]
      if (msg) toast.success(msg, { duration: 5000 })
    }
  }, [order.status])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light text-foreground">
            {isCancelled ? 'Pedido cancelado' : 'Estado del pedido'}
          </h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        {order.table_number != null && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Mesa</p>
            <p className="font-serif text-xl font-light text-primary">{order.table_number}</p>
          </div>
        )}
      </div>

      {/* Status stepper */}
      {isCancelled ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-8 text-center">
          <p className="text-3xl">❌</p>
          <p className="mt-3 font-medium text-foreground">Este pedido fue cancelado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Por favor acercate al mostrador si tenés alguna duda.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 bg-card/40 px-6 py-6">
          <ol className="relative space-y-0">
            {STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep
              const isCurrent = idx === currentStep
              const isLast = idx === STEPS.length - 1

              return (
                <li key={step.status} className="flex gap-4">
                  {/* Line + circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm transition-all duration-500',
                        isCompleted
                          ? 'border-primary bg-primary text-primary-foreground'
                          : isCurrent
                          ? 'border-primary bg-primary/10 text-primary ring-4 ring-primary/20'
                          : 'border-border/40 bg-muted/20 text-muted-foreground/30'
                      )}
                    >
                      {isCompleted ? '✓' : step.icon}
                    </div>
                    {!isLast && (
                      <div
                        className={cn(
                          'my-1 w-px flex-1 transition-colors duration-500',
                          isCompleted ? 'bg-primary/40' : 'bg-border/30'
                        )}
                        style={{ minHeight: '1.5rem' }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <div className={cn('pb-6', isLast && 'pb-0')}>
                    <p
                      className={cn(
                        'mt-1 text-sm font-medium transition-colors',
                        isCompleted ? 'text-muted-foreground' : isCurrent ? 'text-foreground' : 'text-muted-foreground/40'
                      )}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {step.status === 'pending' && 'Recibimos tu pedido, gracias por esperar.'}
                        {step.status === 'confirmed' && 'El equipo ya lo vio y está en la cola.'}
                        {step.status === 'preparing' && 'Lo estamos haciendo con cariño.'}
                        {step.status === 'ready' && '¡El mozo lo lleva a tu mesa!'}
                        {step.status === 'completed' && '¡Gracias por elegirnos!'}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {/* Items */}
      <div className="rounded-2xl border border-border/50 bg-card/40">
        <div className="border-b border-border/30 px-5 py-3">
          <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Tu pedido
          </h2>
        </div>
        <ul className="divide-y divide-border/20 px-5">
          {order.items.map(item => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="text-foreground">
                <span className="mr-2 tabular-nums text-muted-foreground">{item.quantity}×</span>
                {item.product_name ?? <span className="italic text-muted-foreground/60">Producto</span>}
              </span>
              <span className="shrink-0 font-medium text-foreground">
                ${Number(item.subtotal).toLocaleString('es-AR')}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-border/30 px-5 py-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-serif text-lg font-light text-primary">
            ${order.total.toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      {order.notes && (
        <div className="flex items-start gap-2 rounded-xl border border-border/30 bg-muted/10 px-4 py-3 text-sm">
          <span className="shrink-0 text-muted-foreground/60">Nota:</span>
          <span className="text-muted-foreground">{order.notes}</span>
        </div>
      )}

      {!isDone && (
        <p className="text-center text-xs text-muted-foreground/50">
          La página se actualiza automáticamente.
        </p>
      )}
    </div>
  )
}
