'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useStoreCart } from '@/lib/store-cart-context'
import { checkoutAction } from '@/app/actions/checkout.action'
import { premiumEase } from '@/lib/animations'
import type { CheckoutOrderItem } from '@/types/cart'

const schema = z.object({
  full_name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

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

interface StoreCheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StoreCheckoutModal({ isOpen, onClose }: StoreCheckoutModalProps) {
  const { items, totalPrice, clearCart } = useStoreCart()
  const [orderId, setOrderId] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const checkoutItems: CheckoutOrderItem[] = items.map(item => ({
    productId: item.productId,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitSubtotal / item.quantity,
    subtotal: item.subtotal,
  }))

  const hasUnlinkedItems = false

  async function onSubmit(values: FormValues) {
    setServerError(null)

    if (checkoutItems.length === 0) {
      setServerError('No hay productos válidos para procesar la compra.')
      return
    }

    const result = await checkoutAction(
      { full_name: values.full_name, email: values.email, phone: values.phone, notes: values.notes },
      checkoutItems,
      'store'
    )

    if (result.success) {
      setOrderId(result.orderId)
      clearCart()
      reset()
    } else {
      setServerError(result.error)
    }
  }

  function handleClose() {
    onClose()
    setTimeout(() => {
      setOrderId(null)
      setServerError(null)
      reset()
    }, 400)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="store-checkout-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            key="store-checkout-modal"
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
              {orderId ? (
                <motion.div
                  key="store-success"
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
                    ¡Compra confirmada!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Tu compra fue registrada con éxito.
                    <br />
                    Podés retirarla en la cafetería cuando quieras.
                  </p>
                  <p className="mt-1 rounded-full bg-muted/50 px-4 py-1.5 font-mono text-xs text-muted-foreground">
                    #{orderId.slice(0, 8).toUpperCase()}
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-4 rounded-full bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Cerrar
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="store-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid md:grid-cols-[1fr_1.2fr]"
                >
                  {/* Order summary */}
                  <div className="border-b border-border/50 bg-card/30 p-6 md:border-b-0 md:border-r">
                    <h3 className="mb-4 font-serif text-lg font-medium text-foreground">
                      Tu Compra
                    </h3>
                    <ul className="space-y-3">
                      {items.map(item => (
                        <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                          <span className="flex-1 text-muted-foreground">
                            {item.name}
                            {item.weight && (
                              <span className="ml-1 text-xs text-muted-foreground/50">
                                {item.weight}
                              </span>
                            )}
                            <span className="ml-1 text-xs text-muted-foreground/50">
                              x{item.quantity}
                            </span>
                          </span>
                          <span className="shrink-0 font-medium text-foreground">
                            ${item.subtotal.toLocaleString('es-AR')}
                          </span>
                        </li>
                      ))}
                    </ul>



                    <div className="mt-4 border-t border-border/50 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total</span>
                        <span className="font-serif text-2xl font-light text-primary">
                          ${totalPrice.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground/60">
                        Retiro en cafetería · Sin costo de envío
                      </p>
                    </div>
                  </div>

                  {/* Customer form */}
                  <div className="p-6">
                    <h3 className="mb-5 font-serif text-lg font-medium text-foreground">
                      Tus Datos
                    </h3>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                      <Field label="Nombre completo" error={errors.full_name?.message} required>
                        <input
                          {...register('full_name')}
                          placeholder="Juan García"
                          className={inputClass(!!errors.full_name)}
                        />
                      </Field>

                      <Field label="Email" error={errors.email?.message} required>
                        <input
                          {...register('email')}
                          type="email"
                          placeholder="juan@ejemplo.com"
                          className={inputClass(!!errors.email)}
                        />
                      </Field>

                      <Field label="Teléfono" error={errors.phone?.message}>
                        <input
                          {...register('phone')}
                          type="tel"
                          placeholder="+54 11 1234-5678"
                          className={inputClass(!!errors.phone)}
                        />
                      </Field>

                      <Field label="Notas" error={errors.notes?.message}>
                        <textarea
                          {...register('notes')}
                          rows={2}
                          placeholder="Preferencia de molienda, horario de retiro..."
                          className={cn(inputClass(!!errors.notes), 'resize-none')}
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
                          <>
                            <SpinnerIcon className="h-4 w-4" />
                            Procesando...
                          </>
                        ) : (
                          'Confirmar Compra'
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

function inputClass(hasError: boolean) {
  return cn(
    'w-full rounded-xl border bg-card/50 px-4 py-2.5 text-sm text-foreground backdrop-blur-sm',
    'placeholder:text-muted-foreground/50 transition-shadow duration-200',
    'focus:outline-none focus:ring-2 focus:ring-primary/30',
    hasError ? 'border-destructive/50' : 'border-border'
  )
}

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
