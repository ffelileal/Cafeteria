'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PremiumButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  href?: string
  onClick?: () => void
}

export function PremiumButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  href,
  onClick,
}: PremiumButtonProps) {
  const baseStyles = 'relative inline-flex items-center justify-center font-mono text-sm uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden group'
  
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'bg-transparent border border-foreground/20 text-foreground hover:border-primary hover:text-primary',
  }

  const sizes = {
    sm: 'px-5 py-2.5 text-xs',
    md: 'px-8 py-4 text-xs',
    lg: 'px-10 py-5 text-sm',
  }

  const combinedStyles = cn(baseStyles, variants[variant], sizes[size], className)

  const MotionComponent = href ? motion.a : motion.button

  return (
    <MotionComponent
      href={href}
      onClick={onClick}
      className={combinedStyles}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      <motion.span
        className="absolute inset-0 z-0 bg-foreground/5"
        initial={{ x: '-100%' }}
        whileHover={{ x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </MotionComponent>
  )
}
