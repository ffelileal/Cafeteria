'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { CONTACT_INFO } from '@/lib/constants'
import { premiumEase } from '@/lib/animations'

// --- Icons ---

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

const BagIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
)

// --- Helper ---

function buildWhatsAppMessage(
  items: ReturnType<typeof useCart>['items'],
  total: number
): string {
  const lines = items
    .map(
      item =>
        `• ${item.name} x${item.quantity} — $${(item.price * item.quantity).toLocaleString('es-AR')}`
    )
    .join('\n')
  return `*Pedido ARTISAN Coffee* ☕\n\n${lines}\n\n*Total: $${total.toLocaleString('es-AR')}*\n\nHecho desde artisancoffee.com`
}

// --- Component ---

export function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isOpen, setIsOpen } =
    useCart()

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleWhatsApp = () => {
    const phone = CONTACT_INFO.phone.replace(/\D/g, '')
    const message = buildWhatsAppMessage(items, totalPrice)
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: premiumEase }}
            className="fixed right-0 top-0 z-[61] flex h-full w-full flex-col bg-background shadow-2xl sm:w-[420px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 px-6 py-5">
              <div className="flex items-center gap-3">
                <BagIcon className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-xl font-light text-foreground">Tu Pedido</h2>
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
                  <BagIcon className="h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Tu carrito está vacío</p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-xs text-primary underline-offset-4 hover:underline"
                  >
                    Explorar el menú
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map(item => (
                      <motion.li
                        key={item.name}
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
                          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground/50">
                            {item.categoryName}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            ${item.price.toLocaleString('es-AR')} c/u
                          </p>
                        </div>

                        <div className="flex flex-col items-end justify-between gap-2">
                          {/* Subtotal */}
                          <span className="font-serif text-sm font-medium text-primary">
                            ${(item.price * item.quantity).toLocaleString('es-AR')}
                          </span>

                          {/* Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.name, -1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs transition-colors hover:border-primary hover:text-primary"
                              aria-label="Restar uno"
                            >
                              −
                            </button>
                            <span className="min-w-[1.25rem] text-center text-xs font-medium text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.name, 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs transition-colors hover:border-primary hover:text-primary"
                              aria-label="Sumar uno"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeItem(item.name)}
                              className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:text-destructive"
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
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-serif text-2xl font-light text-primary">
                    ${totalPrice.toLocaleString('es-AR')}
                  </span>
                </div>

                {/* WhatsApp CTA */}
                <button
                  onClick={handleWhatsApp}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-medium text-white transition-all duration-200',
                    'bg-[#25D366] hover:bg-[#20bc5a] active:scale-[0.98]'
                  )}
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Enviar pedido por WhatsApp
                </button>

                {/* Clear cart */}
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
  )
}
