'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Coffee, PackageCheck, Sparkles } from 'lucide-react'
import { Container } from '@/components/container'
import { SectionTitle } from '@/components/section-title'
import { PremiumButton } from '@/components/premium-button'
import { StoreCartProvider, useStoreCart } from '@/lib/store-cart-context'
import { StoreCartDrawer } from '@/components/store-cart-drawer'
import type { MenuItem } from '@/lib/constants'
import { CoffeeSelectionModal, type StoreProduct } from './coffee-selection-modal'

const ShopBagIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

const products: StoreProduct[] = [
  {
    name: 'Colombia Huila',
    description: 'Notas de cacao, miel y cuerpo cremoso para una molienda diaria equilibrada.',
    price: 4200,
    size: '250 g',
    featured: true,
    badge: 'Premium',
    accent: 'from-amber-950 via-stone-900 to-amber-900',
    isCoffee: true,
  },
  {
    name: 'Brasil Cerrado',
    description: 'Chocolate suave, final dulce y cafeína equilibrada para el ritual de la mañana.',
    price: 3900,
    size: '250 g',
    featured: true,
    badge: 'Top pick',
    accent: 'from-stone-950 via-neutral-900 to-stone-800',
    isCoffee: true,
  },
  {
    name: 'Etiopía Yirgacheffe',
    description: 'Floral, brillante y delicado, ideal para un café de filtro o espresso.',
    price: 4500,
    size: '250 g',
    badge: 'Nueva selección',
    accent: 'from-orange-950 via-amber-950 to-orange-900',
    isCoffee: true,
  },
  {
    name: 'Mug ARTISAN',
    description: 'Taza premium con acabado mate y silueta delicada para el ritual diario.',
    price: 2800,
    size: 'Un solo',
    accent: 'from-neutral-950 via-stone-900 to-neutral-800',
  },
  {
    name: 'Tote Bag ARTISAN',
    description: 'Bolsa textil premium con diseño minimalista y bordado artesanal.',
    price: 2200,
    size: 'Talla única',
    accent: 'from-emerald-950 via-stone-900 to-emerald-900',
  },
  {
    name: 'Termo premium',
    description: 'Aislamiento térmico, exterior mate y un acabado refinado para el día entero.',
    price: 5400,
    size: '500 ml',
    featured: true,
    badge: 'Líder',
    accent: 'from-slate-950 via-stone-900 to-slate-800',
  },
]

export function StoreSection() {
  return (
    <StoreCartProvider>
      <StoreSectionContent />
    </StoreCartProvider>
  )
}

function StoreSectionContent() {
  const { addItem, setIsOpen, totalItems } = useStoreCart()
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null)

  return (
    <section id="tienda" className="pb-16 sm:pb-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <div className="flex items-start justify-between gap-4">
              <SectionTitle
                eyebrow="Tienda"
                title="Boutique premium de granos y objetos de café."
                subtitle="Una selección cuidada: granos especiales, piezas funcionales y objetos de uso diario que elevan el ritual del café."
                align="left"
                dark
                className="mb-0"
              />
              {totalItems > 0 && (
                <button
                  onClick={() => setIsOpen(true)}
                  aria-label="Ver carrito de tienda"
                  className="relative mt-1 shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-foreground/80 transition-colors hover:border-primary hover:text-primary"
                >
                  <ShopBagIcon className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                </button>
              )}
            </div>
            <div className="mt-8 space-y-4 text-sm leading-7 text-muted-foreground">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-4 w-4 text-primary" />
                <p>Selección pequeña, con intención y sin exceso.</p>
              </div>
              <div className="flex items-start gap-3">
                <Coffee className="mt-1 h-4 w-4 text-primary" />
                <p>Productos pensados para que el café se sienta aún más especial.</p>
              </div>
              <div className="flex items-start gap-3">
                <PackageCheck className="mt-1 h-4 w-4 text-primary" />
                <p>Minimalista, premium y listo para sumar al ritual diario.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {products.map((product, index) => (
              <motion.article
                key={product.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -5 }}
                className="overflow-hidden rounded-[26px] border border-border/60 bg-card shadow-[0_20px_80px_rgba(15,23,42,0.06)]"
              >
                <div className={`relative h-40 bg-gradient-to-br ${product.accent}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_22%)]" />
                  <div className="absolute inset-0 flex items-end justify-between p-4">
                    {product.badge ? (
                      <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white">
                        {product.badge}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs uppercase tracking-[0.2em] text-white/80">{product.size}</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-xl text-foreground">{product.name}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{product.description}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <p className="font-medium text-foreground">
                      ${product.price.toLocaleString('es-MX')}
                    </p>
                    <PremiumButton
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (product.isCoffee) {
                          setSelectedProduct(product)
                          return
                        }

                        addItem(product, 'Tienda')
                        setIsOpen(true)
                      }}
                    >
                      {product.isCoffee ? 'Personalizar' : 'Agregar'}
                    </PremiumButton>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </Container>

      <CoffeeSelectionModal
        open={selectedProduct !== null}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onConfirm={details => {
          if (!selectedProduct) {
            return
          }

          addItem(selectedProduct, 'Tienda', details)
          setSelectedProduct(null)
          setIsOpen(true)
        }}
      />

      <StoreCartDrawer />
    </section>
  )
}
