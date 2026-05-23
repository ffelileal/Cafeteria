'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Container } from '@/components/container'
import { SectionTitle } from '@/components/section-title'
import { CartDrawer } from '@/components/cart-drawer'
import { COFFEE_ORIGINS, MILK_OPTIONS, EXTRAS } from '@/lib/constants'
import { fadeInUp, staggerContainer, cardHover, premiumEase } from '@/lib/animations'
import { getPopularityBadge } from '@/lib/menu-utils'
import { useCart } from '@/lib/cart-context'
import { useProducts } from '@/hooks/use-products'
import type { MenuProduct } from '@/services/products'

// --- Types ---

type FilterId = 'all' | 'hot' | 'cold' | 'popular' | 'vegano' | 'sin-tacc'

type MenuItemWithCategory = MenuProduct & {
  categoryName: string
  categoryId: string
}

// --- Module-level constants ---

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'hot', label: 'Caliente' },
  { id: 'cold', label: 'Frío' },
  { id: 'popular', label: 'Más vendidos' },
  { id: 'vegano', label: 'Vegano' },
  { id: 'sin-tacc', label: 'Sin TACC' },
]

// --- Icons ---

const CoffeeBean = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2C8 2 4 6 4 10c0 5 4 12 8 12s8-7 8-12c0-4-4-8-8-8z" />
    <path d="M12 2v20" />
    <path d="M4 10c4 0 8 2 8 6" />
    <path d="M20 10c-4 0-8 2-8 6" />
  </svg>
)

const FireIcon = ({ intensity }: { intensity: number }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className={cn('h-2 w-1 rounded-full transition-colors', i < intensity ? 'bg-primary' : 'bg-border')}
      />
    ))}
  </div>
)

const SnowflakeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
  </svg>
)

const FlameIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2c0 4-4 6-4 10 0 3.31 2.69 6 6 6s6-2.69 6-6c0-4-4-6-4-10-2 2-4 2-4 0z" />
  </svg>
)

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const BagIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

// --- Skeleton ---

function MenuSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-48 animate-pulse rounded-2xl border border-border/30 bg-card/30"
        />
      ))}
    </div>
  )
}

// --- Component ---

export function MenuSection() {
  const { categories, allItems, isLoading, error } = useProducts()

  const [activeCategory, setActiveCategory] = useState('')
  const [showOrigins, setShowOrigins] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterId>('all')

  // Set initial category once data loads
  useEffect(() => {
    if (categories.length > 0 && activeCategory === '') {
      setActiveCategory(categories[0].id)
    }
  }, [categories, activeCategory])

  const isFiltered = searchQuery.trim().length > 0 || activeFilter !== 'all'

  const activeDescription = useMemo(
    () => categories.find(cat => cat.id === activeCategory)?.description ?? '',
    [activeCategory, categories]
  )

  const displayItems = useMemo<MenuItemWithCategory[]>(() => {
    const base: MenuItemWithCategory[] = isFiltered
      ? allItems
      : (() => {
          const cat = categories.find(c => c.id === activeCategory)
          return (cat?.items ?? []).map(item => ({
            ...item,
            categoryName: cat?.name ?? '',
            categoryId: activeCategory,
          }))
        })()

    const q = searchQuery.trim().toLowerCase()

    return base.filter(item => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)

      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'hot' && !!item.hot) ||
        (activeFilter === 'cold' && !!item.cold) ||
        (activeFilter === 'popular' && item.popularity >= 75) ||
        (activeFilter === 'vegano' && (item.tags?.includes('vegano') ?? false)) ||
        (activeFilter === 'sin-tacc' && (item.tags?.includes('sin tacc') ?? false))

      return matchesSearch && matchesFilter
    })
  }, [isFiltered, activeCategory, searchQuery, activeFilter, allItems, categories])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setActiveFilter('all')
  }, [])

  const { addItem, updateQuantity, items: cartItems, totalItems, setIsOpen: openCart } = useCart()

  return (
    <section id="menu" className="relative bg-background py-24 md:py-32">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-40 bottom-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <Container className="relative z-10">
        <div className="mb-8 flex flex-col items-center gap-6 text-center">
          <SectionTitle
            eyebrow="Nuestra Carta"
            title="El Menú"
            subtitle="Cada preparación es una obra de arte. Selecciona tu experiencia perfecta."
            align="center"
          />
          <button
            type="button"
            onClick={() => openCart(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
          >
            <BagIcon className="h-4 w-4" />
            {totalItems > 0 ? `Carrito (${totalItems})` : 'Ver carrito'}
          </button>
        </div>

        {/* Toggle: Bebidas / Nuestros Granos */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-12 flex justify-center"
        >
          <div className="inline-flex rounded-full border border-border bg-card/50 p-1 backdrop-blur-sm">
            <button
              onClick={() => setShowOrigins(false)}
              className={cn(
                'rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300',
                !showOrigins ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Bebidas
            </button>
            <button
              onClick={() => setShowOrigins(true)}
              className={cn(
                'rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300',
                showOrigins ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Nuestros Granos
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── MENU VIEW ── */}
          {!showOrigins ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: premiumEase }}
            >
              {/* Search + Filters */}
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mb-8 space-y-4"
              >
                {/* Search input */}
                <div className="relative mx-auto max-w-md">
                  <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar en el menú..."
                    className="w-full rounded-full border border-border bg-card/50 py-3 pl-11 pr-10 text-sm text-foreground backdrop-blur-sm placeholder:text-muted-foreground/60 transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <XIcon className="h-4 w-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Filter chips */}
                <div className="flex flex-wrap justify-center gap-2">
                  {FILTERS.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={cn(
                        'rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200',
                        activeFilter === filter.id
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'border border-border bg-card/30 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Category tabs — hidden when filter is active */}
              <AnimatePresence>
                {!isFiltered && (
                  <motion.div
                    key="category-nav"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: premiumEase }}
                    className="overflow-hidden"
                  >
                    <div className="mb-8 flex flex-wrap justify-center gap-2 md:gap-3">
                      {categories.map(category => (
                        <button
                          key={category.id}
                          onClick={() => setActiveCategory(category.id)}
                          className={cn(
                            'relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 md:px-6',
                            activeCategory === category.id
                              ? 'text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {activeCategory === category.id && (
                            <motion.div
                              layoutId="activeCategory"
                              className="absolute inset-0 rounded-full bg-primary"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10">{category.name}</span>
                        </button>
                      ))}
                    </div>

                    <motion.p
                      key={activeCategory}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-10 text-center text-muted-foreground"
                    >
                      {activeDescription}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results count when filtered */}
              <AnimatePresence>
                {isFiltered && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="mb-6 flex items-center justify-between"
                  >
                    <p className="text-sm text-muted-foreground">
                      {displayItems.length}{' '}
                      {displayItems.length === 1 ? 'resultado' : 'resultados'}
                    </p>
                    <button
                      onClick={clearFilters}
                      className="text-xs text-primary transition-colors hover:text-primary/70"
                    >
                      Limpiar filtros
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Items grid / skeleton / error / empty */}
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <MenuSkeleton />
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="py-24 text-center"
                  >
                    <p className="text-sm text-muted-foreground">
                      No se pudo cargar el menú. Intentá de nuevo.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground/50">{error}</p>
                  </motion.div>
                ) : displayItems.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="py-24 text-center"
                  >
                    <p className="text-muted-foreground">
                      No se encontraron productos para tu búsqueda.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-sm text-primary transition-colors hover:text-primary/70"
                    >
                      Limpiar búsqueda
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="grid"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {displayItems.map((item, index) => {
                      const badge = getPopularityBadge(item.popularity)
                      const showStarBadge = !badge && !!item.featured
                      const isOutOfStock = item.stock === 0
                      const cartItem = cartItems.find(ci => ci.name === item.name)

                      return (
                        <motion.div
                          key={`${item.categoryId}-${item.name}`}
                          variants={fadeInUp}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.04 }}
                          whileHover="hover"
                          className="group"
                        >
                          <motion.div
                            variants={cardHover}
                            className={cn(
                              'relative h-full rounded-2xl border bg-card/40 p-6 backdrop-blur-sm',
                              'transition-all duration-300 hover:shadow-[0_0_40px_-12px]',
                              badge || showStarBadge
                                ? 'border-primary/20 hover:shadow-primary/15'
                                : 'border-white/[0.07] hover:border-primary/20 hover:shadow-primary/10'
                            )}
                          >
                            {/* Badge */}
                            {isOutOfStock ? (
                              <div className="absolute -top-3 left-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                  Agotado
                                </span>
                              </div>
                            ) : badge ? (
                              <div className="absolute -top-3 left-4">
                                <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium', badge.className)}>
                                  {badge.emoji} {badge.label}
                                </span>
                              </div>
                            ) : showStarBadge ? (
                              <div className="absolute -top-3 right-4">
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                                  <StarIcon className="h-3 w-3" />
                                  Popular
                                </span>
                              </div>
                            ) : null}

                            {/* Category label (filtered view) */}
                            {isFiltered && (
                              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/50">
                                {item.categoryName}
                              </p>
                            )}

                            {/* Name + Price */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-serif text-lg font-medium text-foreground">
                                  {item.name}
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                <span className="font-serif text-xl font-medium text-primary">
                                  ${item.price.toLocaleString('es-AR')}
                                </span>
                                {item.size && (
                                  <p className="mt-0.5 text-xs text-muted-foreground">{item.size}</p>
                                )}
                              </div>
                            </div>

                            {/* Tags */}
                            {item.tags != null && item.tags.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {item.tags.map(tag => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground/70"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Details row */}
                            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              {item.intensity != null && (
                                <div className="flex items-center gap-1.5">
                                  <span>Intensidad</span>
                                  <FireIcon intensity={item.intensity} />
                                </div>
                              )}
                              {item.time && (
                                <span className="rounded-full bg-muted/50 px-2 py-0.5">
                                  {item.time}
                                </span>
                              )}
                              {item.serves != null && (
                                <span className="rounded-full bg-muted/50 px-2 py-0.5">
                                  {item.serves} {item.serves === 1 ? 'persona' : 'personas'}
                                </span>
                              )}
                              {(item.hot ?? item.cold) && (
                                <div className="flex gap-1">
                                  {item.hot && (
                                    <span className="flex items-center gap-0.5 rounded-full bg-orange-500/10 px-2 py-0.5 text-orange-400">
                                      <FlameIcon className="h-3 w-3" />
                                    </span>
                                  )}
                                  {item.cold && (
                                    <span className="flex items-center gap-0.5 rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-400">
                                      <SnowflakeIcon className="h-3 w-3" />
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Cart controls */}
                            <div className="mt-4 border-t border-border/30 pt-4">
                              <AnimatePresence mode="wait">
                                {cartItem ? (
                                  <motion.div
                                    key="controls"
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                    className="flex items-center justify-between"
                                  >
                                    <span className="text-xs text-muted-foreground">En tu pedido</span>
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => updateQuantity(cartItem.id, -1)}
                                        className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-sm transition-colors hover:border-primary hover:text-primary"
                                        aria-label="Restar uno"
                                      >
                                        −
                                      </button>
                                      <span className="min-w-[1.25rem] text-center text-sm font-medium text-foreground">
                                        {cartItem.quantity}
                                      </span>
                                      <button
                                        onClick={() => updateQuantity(cartItem.id, 1)}
                                        disabled={cartItem.quantity >= item.stock}
                                        className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-sm transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                                        aria-label="Sumar uno"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </motion.div>
                                ) : (
                                  <motion.button
                                    key="add"
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                    disabled={isOutOfStock}
                                    onClick={() => {
                                      addItem(item, item.categoryName, undefined, item.id)
                                      toast.success('Agregado al carrito', { description: item.name })
                                    }}
                                    className="w-full rounded-full border border-border/60 py-2 text-xs font-medium uppercase tracking-widest text-muted-foreground transition-all duration-200 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    {isOutOfStock ? 'Sin stock' : 'Agregar'}
                                  </motion.button>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Milk options + Extras — only when not filtered and not loading */}
              <AnimatePresence>
                {!isFiltered && !isLoading && (
                  <motion.div
                    key="extras"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-16 grid gap-8 md:grid-cols-2"
                  >
                    <div className="rounded-2xl border border-border bg-card/30 p-6 backdrop-blur-sm">
                      <h3 className="mb-4 font-serif text-xl font-medium text-foreground">
                        Leches Alternativas
                      </h3>
                      <div className="space-y-2">
                        {MILK_OPTIONS.map(milk => (
                          <div key={milk.name} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{milk.name}</span>
                            <span className="text-foreground">
                              {milk.price === 0 ? 'Incluido' : `+$${milk.price}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card/30 p-6 backdrop-blur-sm">
                      <h3 className="mb-4 font-serif text-xl font-medium text-foreground">
                        Extras
                      </h3>
                      <div className="space-y-2">
                        {EXTRAS.map(extra => (
                          <div key={extra.name} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{extra.name}</span>
                            <span className="text-foreground">+${extra.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          ) : (
            /* ── ORIGINS VIEW ── */
            <motion.div
              key="origins"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: premiumEase }}
            >
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mb-12 text-center"
              >
                <p className="mx-auto max-w-2xl text-muted-foreground">
                  Trabajamos directamente con productores de las mejores regiones
                  cafetaleras del mundo. Cada origen cuenta una historia única.
                </p>
              </motion.div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {COFFEE_ORIGINS.map((origin, index) => (
                  <motion.div
                    key={origin.id}
                    variants={fadeInUp}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30">
                      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CoffeeBean className="h-16 w-16 text-primary/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <span className="inline-block rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                            {origin.country}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="font-serif text-xl font-medium text-foreground">
                          {origin.name}
                        </h3>
                        <p className="mt-1 text-sm text-primary">{origin.region}</p>
                        <p className="mt-3 text-sm text-muted-foreground">{origin.profile}</p>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">Altitud</span>
                            <p className="mt-0.5 font-medium text-foreground">{origin.altitude}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Proceso</span>
                            <p className="mt-0.5 font-medium text-foreground">{origin.process}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Acidez</span>
                            <p className="mt-0.5 font-medium text-foreground">{origin.acidity}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cuerpo</span>
                            <p className="mt-0.5 font-medium text-foreground">{origin.body}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                          <span className="text-xs text-muted-foreground">Tueste</span>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            {origin.roast}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center"
              >
                <CoffeeBean className="mx-auto mb-4 h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Todos nuestros granos están disponibles para compra en bolsas de 250g y 500g.
                  <br className="hidden sm:block" />
                  Pregunta a nuestros baristas por el grano del mes y descuentos especiales.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
      <CartDrawer />
    </section>
  )
}
