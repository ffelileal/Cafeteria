'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { checkoutAction } from '@/app/actions/checkout.action'
import { premiumEase } from '@/lib/animations'
import type { CheckoutOrderItem } from '@/types/cart'

// ── Icons ─────────────────────────────────────────────────────────────────────

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const SpinnerIcon = ({ className }: { className?: string }) => (
  <svg className={cn('animate-spin', className)} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMesaSlug(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('mesa')
}

function formatMesaLabel(slug: string): string {
  // "interior-01" → "Interior · Mesa 01"
  const parts = slug.split('-')
  const sector = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : ''
  const num = parts[1] ? `Mesa ${parts[1]}` : ''
  return [sector, num].filter(Boolean).join(' · ')
}

const inputClass = (hasError?: boolean) =>
  cn(
    'w-full rounded-xl border bg-card/50 px-4 py-2.5 text-sm text-foreground backdrop-blur-sm',
    'placeholder:text-muted-foreground/50 transition-shadow duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary/30',
    hasError ? 'border-destructive/50' : 'border-border'
  )

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ── Order summary (shared) ────────────────────────────────────────────────────

function OrderSummary({
  items,
  totalPrice,
  hasUnlinkedItems,
}: {
  items: ReturnType<typeof useCart>['items']
  totalPrice: number
  hasUnlinkedItems: boolean
}) {
  return (
    <div className="border-b border-border/50 bg-card/30 p-6 md:border-b-0 md:border-r">
      <h3 className="mb-4 font-serif text-lg font-medium text-foreground">Tu Pedido</h3>
      <ul className="space-y-3">
        {items.map(item => (
          <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
            <span className="flex-1 text-muted-foreground">
              {item.name}
              <span className="ml-1 text-xs text-muted-foreground/50">x{item.quantity}</span>
            </span>
            <span className="shrink-0 font-medium text-foreground">
              ${item.subtotal.toLocaleString('es-AR')}
            </span>
          </li>
        ))}
      </ul>
      {hasUnlinkedItems && (
        <p className="mt-3 text-xs text-yellow-500/80">
          Algunos productos no pueden procesarse. Volvé a agregarlos desde el menú.
        </p>
      )}
      <div className="mt-4 border-t border-border/50 pt-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="font-serif text-2xl font-light text-primary">
          ${totalPrice.toLocaleString('es-AR')}
        </span>
      </div>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, totalPrice, clearCart } = useCart()
  const [orderId, setOrderId] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mesaSlug, setMesaSlug] = useState<string | null>(null)

  // Mesa form state
  const [mesaName, setMesaName] = useState('')
  const [mesaNotes, setMesaNotes] = useState('')
  const [mesaNameError, setMesaNameError] = useState('')

  // Full form state
  const [fullName, setFullName] = useState('')
  const [fullEmail, setFullEmail] = useState('')
  const [fullPhone, setFullPhone] = useState('')
  const [fullNotes, setFullNotes] = useState('')
  const [fullErrors, setFullErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setMesaSlug(getMesaSlug())
  }, [])

  const checkoutItems: CheckoutOrderItem[] = items
    .filter((item): item is typeof item & { productId: string } => !!item.productId)
    .map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitSubtotal / item.quantity,
      subtotal: item.subtotal,
    }))

  const hasUnlinkedItems = checkoutItems.length < items.length

  async function handleMesaSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMesaNameError('')
    setServerError(null)

    if (mesaName.trim().length < 2) {
      setMesaNameError('Mínimo 2 caracteres')
      return
    }
    if (checkoutItems.length === 0) {
      setServerError('No hay productos válidos para confirmar el pedido.')
      return
    }

    setIsSubmitting(true)
    const result = await checkoutAction(
      { full_name: mesaName.trim(), notes: mesaNotes.trim() || undefined, table_slug: mesaSlug ?? undefined },
      checkoutItems,
      'menu'
    )
    setIsSubmitting(false)

    if (result.success) {
      setOrderId(result.orderId)
      clearCart()
    } else {
      setServerError(result.error)
    }
  }

  async function handleFullSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errors: Record<string, string> = {}
    if (fullName.trim().length < 2) errors.name = 'Mínimo 2 caracteres'
    if (!fullEmail.trim()) errors.email = 'Email requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fullEmail)) errors.email = 'Email inválido'
    setFullErrors(errors)
    if (Object.keys(errors).length > 0) return

    setServerError(null)
    if (checkoutItems.length === 0) {
      setServerError('No hay productos válidos para confirmar el pedido.')
      return
    }

    setIsSubmitting(true)
    const result = await checkoutAction(
      { full_name: fullName.trim(), email: fullEmail.trim(), phone: fullPhone.trim() || undefined, notes: fullNotes.trim() || undefined },
      checkoutItems,
      'menu'
    )
    setIsSubmitting(false)

    if (result.success) {
      setOrderId(result.orderId)
      clearCart()
    } else {
      setServerError(result.error)
    }
  }

  function handleClose() {
    onClose()
    setTimeout(() => {
      setOrderId(null)
      setServerError(null)
      setIsSubmitting(false)
      setMesaName('')
      setMesaNotes('')
      setMesaNameError('')
      setFullName('')
      setFullEmail('')
      setFullPhone('')
      setFullNotes('')
      setFullErrors({})
    }, 400)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="checkout-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="checkout-modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.35, ease: premiumEase }}
            className="fixed inset-x-4 top-1/2 z-[71] mx-auto max-w-2xl -translate-y-1/2 overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl md:inset-x-auto md:left-1/2 md:w-full md:-translate-x-1/2"
          >
            <button
              onClick={handleClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <XIcon className="h-4 w-4" />
            </button>

            <AnimatePresence mode="wait">
              {/* ── Success ── */}
              {orderId ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-4 px-8 py-16 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <CheckIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="font-serif text-2xl font-light text-foreground">
                    ¡Pedido confirmado!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Tu pedido fue recibido y está siendo preparado.
                    {mesaSlug && (
                      <><br />En breve un mozo se acerca a tu mesa.</>
                    )}
                  </p>
                  <p className="mt-1 rounded-full bg-muted/50 px-4 py-1.5 font-mono text-xs text-muted-foreground">
                    #{orderId.slice(0, 8).toUpperCase()}
                  </p>
                  <div className="mt-4 flex flex-col items-center gap-3">
                    <a
                      href={`/pedido/${orderId}`}
                      className="rounded-full bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Ver estado del pedido →
                    </a>
                    <button
                      onClick={handleClose}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </motion.div>

              ) : mesaSlug ? (
                /* ── Mesa form (simplified) ── */
                <motion.div
                  key="mesa-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid md:grid-cols-[1fr_1.2fr]"
                >
                  <OrderSummary items={items} totalPrice={totalPrice} hasUnlinkedItems={hasUnlinkedItems} />

                  <div className="p-6">
                    {/* Mesa badge */}
                    <div className="mb-5 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5">
                      <span className="text-sm">📍</span>
                      <p className="text-sm font-medium text-primary">
                        {formatMesaLabel(mesaSlug)}
                      </p>
                    </div>

                    <h3 className="mb-5 font-serif text-lg font-medium text-foreground">
                      ¿Tu nombre?
                    </h3>

                    <form onSubmit={handleMesaSubmit} className="space-y-4" noValidate>
                      <Field label="Nombre" error={mesaNameError} required>
                        <input
                          value={mesaName}
                          onChange={e => setMesaName(e.target.value)}
                          placeholder="Juan"
                          autoFocus
                          className={inputClass(!!mesaNameError)}
                        />
                      </Field>

                      <Field label="Notas del pedido">
                        <textarea
                          value={mesaNotes}
                          onChange={e => setMesaNotes(e.target.value)}
                          rows={2}
                          placeholder="Sin azúcar, alergia a nueces..."
                          className={cn(inputClass(), 'resize-none')}
                        />
                      </Field>

                      {serverError && (
                        <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
                          {serverError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting || checkoutItems.length === 0}
                        className={cn(
                          'flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition-all duration-200',
                          'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]',
                          'disabled:cursor-not-allowed disabled:opacity-50'
                        )}
                      >
                        {isSubmitting ? (
                          <><SpinnerIcon className="h-4 w-4" />Procesando...</>
                        ) : (
                          'Confirmar Pedido'
                        )}
                      </button>
                    </form>
                  </div>
                </motion.div>

              ) : (
                /* ── Full form ── */
                <motion.div
                  key="full-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid md:grid-cols-[1fr_1.2fr]"
                >
                  <OrderSummary items={items} totalPrice={totalPrice} hasUnlinkedItems={hasUnlinkedItems} />

                  <div className="p-6">
                    <h3 className="mb-5 font-serif text-lg font-medium text-foreground">
                      Tus Datos
                    </h3>

                    <form onSubmit={handleFullSubmit} className="space-y-4" noValidate>
                      <Field label="Nombre completo" error={fullErrors.name} required>
                        <input
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder="Juan García"
                          className={inputClass(!!fullErrors.name)}
                        />
                      </Field>

                      <Field label="Email" error={fullErrors.email} required>
                        <input
                          value={fullEmail}
                          onChange={e => setFullEmail(e.target.value)}
                          type="email"
                          placeholder="juan@ejemplo.com"
                          className={inputClass(!!fullErrors.email)}
                        />
                      </Field>

                      <Field label="Teléfono">
                        <input
                          value={fullPhone}
                          onChange={e => setFullPhone(e.target.value)}
                          type="tel"
                          placeholder="+54 11 1234-5678"
                          className={inputClass()}
                        />
                      </Field>

                      <Field label="Notas del pedido">
                        <textarea
                          value={fullNotes}
                          onChange={e => setFullNotes(e.target.value)}
                          rows={2}
                          placeholder="Sin azúcar, alergia a nueces..."
                          className={cn(inputClass(), 'resize-none')}
                        />
                      </Field>

                      {serverError && (
                        <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
                          {serverError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting || checkoutItems.length === 0}
                        className={cn(
                          'flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition-all duration-200',
                          'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]',
                          'disabled:cursor-not-allowed disabled:opacity-50'
                        )}
                      >
                        {isSubmitting ? (
                          <><SpinnerIcon className="h-4 w-4" />Procesando...</>
                        ) : (
                          'Confirmar Pedido'
                        )}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
