'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { MenuItem } from '@/lib/constants'
import type { CoffeeGrind, CoffeeSelectionDetails, CoffeeType, CoffeeWeight } from '@/lib/cart-context'
import { premiumEase } from '@/lib/animations'

export type StoreProduct = MenuItem & {
  isCoffee?: boolean
  badge?: string
  accent?: string
}

interface CoffeeSelectionModalProps {
  open: boolean
  product: StoreProduct | null
  onClose: () => void
  onConfirm: (details: CoffeeSelectionDetails) => void
}

const coffeeTypes: Array<{ label: CoffeeType; helper: string }> = [
  { label: 'Café en granos', helper: 'Conserva la frescura y el perfil completo del origen.' },
  { label: 'Café molido', helper: 'Listo para preparar con un método específico.' },
]

const grindOptions: CoffeeGrind[] = [
  'Espresso',
  'Moka',
  'Filtro / V60',
  'Prensa francesa',
  'Aeropress',
]

const weightOptions: CoffeeWeight[] = ['250g', '500g', '1kg']

function getInitialDetails(): CoffeeSelectionDetails {
  return {
    coffeeType: 'Café en granos',
    grind: undefined,
    weight: '250g',
  }
}

export function CoffeeSelectionModal({
  open,
  product,
  onClose,
  onConfirm,
}: CoffeeSelectionModalProps) {
  const [details, setDetails] = useState<CoffeeSelectionDetails>(getInitialDetails())

  useEffect(() => {
    setDetails(getInitialDetails())
  }, [product])

  useEffect(() => {
    if (!open) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [open])

  if (!product) {
    return null
  }

  const coffeeMode = details.coffeeType === 'Café molido'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/65 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.35, ease: premiumEase }}
            onClick={event => event.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(18,12,9,0.98),rgba(31,22,14,0.95))] shadow-[0_30px_140px_rgba(15,23,42,0.34)]"
          >
            <div className="border-b border-white/10 px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-amber-100/80">Personaliza tu café</p>
                  <h2 className="mt-2 font-serif text-2xl text-white sm:text-3xl">{product.name}</h2>
                  <p className="mt-2 text-sm leading-7 text-stone-100/80">{product.description}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-stone-100/80 transition hover:border-amber-100 hover:text-amber-50"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-y-auto px-5 py-5 sm:px-6">
              <section className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.35em] text-amber-100/80">Tipo de café</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {coffeeTypes.map(option => {
                    const selected = details.coffeeType === option.label
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() =>
                          setDetails(current => ({
                            ...current,
                            coffeeType: option.label,
                            grind: option.label === 'Café en granos' ? undefined : current.grind ?? 'Espresso',
                          }))
                        }
                        className={`rounded-[22px] border px-4 py-4 text-left transition ${
                          selected
                            ? 'border-amber-100 bg-white/10 text-white'
                            : 'border-white/10 bg-white/5 text-stone-200/80 hover:border-amber-100/60'
                        }`}
                      >
                        <p className="font-medium text-white">{option.label}</p>
                        <p className="mt-2 text-sm leading-6 text-stone-100/80">{option.helper}</p>
                      </button>
                    )
                  })}
                </div>
              </section>

              {coffeeMode && (
                <section className="mt-6 space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-amber-100/80">Molienda</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {grindOptions.map(option => {
                      const selected = details.grind === option
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setDetails(current => ({ ...current, grind: option }))}
                          className={`rounded-full border px-4 py-2 text-sm transition ${
                            selected
                              ? 'border-amber-100 bg-white/10 text-white'
                              : 'border-white/10 bg-white/5 text-stone-200/80 hover:border-amber-100/60'
                          }`}
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}

              <section className="mt-6 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.35em] text-amber-100/80">Cantidad</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {weightOptions.map(option => {
                    const selected = details.weight === option
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setDetails(current => ({ ...current, weight: option }))}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          selected
                            ? 'border-amber-100 bg-white/10 text-white'
                            : 'border-white/10 bg-white/5 text-stone-200/80 hover:border-amber-100/60'
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </section>

              <div className="mt-6 rounded-[22px] border border-amber-100/20 bg-white/5 px-4 py-3 text-sm text-stone-100/80">
                <span className="font-medium text-white">Resumen:</span>{' '}
                {details.coffeeType} · {details.weight} · {details.grind ?? 'granos enteros'}
              </div>
            </div>

            <div className="border-t border-white/10 px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-amber-100/80">Subtotal</p>
                  <p className="mt-1 font-serif text-2xl text-white">
                    ${((product.price * (details.weight === '250g' ? 1 : details.weight === '500g' ? 2 : 4)).toLocaleString('es-MX'))}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-white/10 px-5 py-3 text-sm uppercase tracking-[0.2em] text-stone-100/80 transition hover:border-amber-100/70 hover:text-amber-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => onConfirm(details)}
                    className="rounded-full bg-amber-100 px-5 py-3 text-sm font-medium uppercase tracking-[0.2em] text-stone-950 transition hover:bg-amber-50"
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
