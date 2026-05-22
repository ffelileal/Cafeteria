'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Container } from '@/components/container'
import { NAV_LINKS, BRAND, CONTACT_INFO } from '@/lib/constants'
import { navbarAnimation, mobileMenuAnimation, staggerContainer, fadeInUp } from '@/lib/animations'
import { useCart } from '@/lib/cart-context'
import { CartDrawer } from '@/components/cart-drawer'

const CartIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { totalItems, setIsOpen: openCart } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <motion.header
        initial="hidden"
        animate="visible"
        variants={navbarAnimation}
        className={cn(
          'fixed left-0 right-0 top-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border/50'
            : 'bg-transparent'
        )}
      >
        <Container>
          <nav className="flex h-20 items-center gap-4 md:h-24">
            {/* Logo */}
            <a
              href="#"
              className="group flex shrink-0 flex-col"
            >
              <span className="font-serif text-xl font-light tracking-[0.2em] text-foreground transition-colors group-hover:text-primary md:text-2xl">
                {BRAND.name}
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {BRAND.tagline}
              </span>
            </a>

            {/* Desktop Navigation */}
            <ul className="hidden flex-1 items-center justify-center gap-8 md:flex lg:gap-12">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group relative text-xs uppercase tracking-[0.2em] text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>

            {/* Right side: Reservar + Cart */}
            <div className="hidden shrink-0 items-center gap-3 md:flex">
              <a
                href={`https://wa.me/${CONTACT_INFO.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 border border-foreground/20 px-6 py-3 text-xs uppercase tracking-[0.2em] text-foreground transition-all duration-300 hover:border-primary hover:text-primary"
              >
                Reservar
              </a>

              {/* Cart button */}
              <button
                onClick={() => openCart(true)}
                aria-label="Abrir carrito"
                className="relative flex h-10 w-10 items-center justify-center text-foreground/80 transition-colors hover:text-primary"
              >
                <CartIcon className="h-5 w-5" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground"
                    >
                      {totalItems > 9 ? '9+' : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Mobile: cart + hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => openCart(true)}
                aria-label="Abrir carrito"
                className="relative flex h-10 w-10 items-center justify-center text-foreground/80 transition-colors hover:text-primary"
              >
                <CartIcon className="h-5 w-5" />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground"
                    >
                      {totalItems > 9 ? '9+' : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5"
                aria-label="Toggle menu"
              >
                <motion.span
                  animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 6 : 0 }}
                  className="h-px w-6 bg-foreground"
                />
                <motion.span
                  animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                  className="h-px w-6 bg-foreground"
                />
                <motion.span
                  animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -6 : 0 }}
                  className="h-px w-6 bg-foreground"
                />
              </button>
            </div>
          </nav>
        </Container>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuAnimation}
            className="fixed inset-0 z-40 flex flex-col bg-background/98 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-1 flex-col items-center justify-center">
              <motion.ul
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center gap-8"
              >
                {NAV_LINKS.map((link) => (
                  <motion.li key={link.href} variants={fadeInUp}>
                    <a
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="font-serif text-3xl font-light text-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
                <motion.li variants={fadeInUp}>
                  <a
                    href={`https://wa.me/${CONTACT_INFO.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mt-4 inline-block border border-primary px-8 py-4 text-xs uppercase tracking-[0.2em] text-primary transition-all hover:bg-primary hover:text-primary-foreground"
                  >
                    Reservar Mesa
                  </a>
                </motion.li>
              </motion.ul>
            </div>

            {/* Mobile menu footer */}
            <div className="border-t border-border/30 p-6">
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Lun - Dom: 7:00 AM - 10:00 PM
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart drawer */}
      <CartDrawer />
    </>
  )
}
