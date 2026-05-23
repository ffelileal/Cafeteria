'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useStoreCart } from '@/lib/store-cart-context'
import { premiumEase } from '@/lib/animations'
import { StoreCheckoutModal } from '@/components/store-checkout-modal'

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </svg>
)

const ShopIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

export function StoreCartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isOpen, setIsOpen } =
    useStoreCart()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="store-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              key="store-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: premiumEase }}
              className="fixed right-0 top-0 z-[61] flex h-full w-full flex-col bg-background shadow-2xl sm:w-[420px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 px-6 py-5">
                <div className="flex items-center gap-3">
                  <ShopIcon className="h-5 w-5 text-primary" />
                  <h2 className="font-serif text-xl font-light text-foreground">Tu Compra</h2>
                  {totalItems > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      {totalItems}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Cerrar carrito"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                    <ShopIcon className="h-12 w-12 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Tu carrito de tienda está vacío</p>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-xs text-primary underline-offset-4 hover:underline"
                    >
                      Explorar la tienda
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    <AnimatePresence initial={false}>
                      {items.map(item => (
                        <motion.li
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.25, ease: premiumEase }}
                          className="flex gap-4 rounded-xl border border-border/50 bg-card/30 p-4"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-serif text-sm font-medium text-foreground">
                              {item.name}
                            </p>
                            {item.weight && (
                              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground/50">
                                {item.coffeeType} · {item.weight}
                                {item.grind ? ` · ${item.grind}` : ''}
                              </p>
                            )}
                            {!item.weight && (
                              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground/50">
                                {item.categoryName}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">
                              ${item.unitSubtotal.toLocaleString('es-AR')} c/u
                            </p>
                          </div>

                          <div className="flex flex-col items-end justify-between gap-2">
                            <span className="font-serif text-sm font-medium text-primary">
                              ${item.subtotal.toLocaleString('es-AR')}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs transition-colors hover:border-primary hover:text-primary"
                                aria-label="Restar uno"
                              >
                                −
                              </button>
                              <span className="min-w-[1.25rem] text-center text-xs font-medium text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs transition-colors hover:border-primary hover:text-primary"
                                aria-label="Sumar uno"
                              >
                                +
                              </button>
                              <button
                                onClick={() => removeItem(item.id)}
                                className={cn(
                                  'ml-1 flex h-6 w-6 items-center justify-center rounded-full',
                                  'text-muted-foreground/50 transition-colors hover:text-destructive'
                                )}
                                aria-label="Eliminar producto"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-border/50 px-6 py-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-serif text-2xl font-light text-primary">
                      ${totalPrice.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/60 -mt-2">
                    Retiro en cafetería · Sin costo de envío
                  </p>

                  <button
                    onClick={() => setCheckoutOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  >
                    Confirmar Compra
                  </button>

                  <button
                    onClick={clearCart}
                    className="w-full text-center text-xs text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                  >
                    Vaciar carrito
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <StoreCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  )
}
