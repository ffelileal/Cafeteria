'use client'

import { cn } from '@/lib/utils'
import { AnimatedWrapper } from './animated-wrapper'

interface SectionTitleProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center' | 'right'
  className?: string
  dark?: boolean
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
  dark = true,
}: SectionTitleProps) {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <AnimatedWrapper animation="fadeInUp" className={cn('mb-12 md:mb-16', className)}>
      <div className={alignmentClasses[align]}>
        {eyebrow && (
          <span className={cn(
            'mb-4 inline-block text-xs font-medium uppercase tracking-[0.3em]',
            dark ? 'text-primary' : 'text-primary/80'
          )}>
            {eyebrow}
          </span>
        )}
        <h2 className={cn(
          'font-serif text-3xl font-light leading-tight sm:text-4xl md:text-5xl lg:text-6xl',
          dark ? 'text-foreground' : 'text-background'
        )}>
          {title}
        </h2>
        {subtitle && (
          <p className={cn(
            'mx-auto mt-4 max-w-2xl text-base font-light leading-relaxed sm:text-lg',
            dark ? 'text-muted-foreground' : 'text-background/70',
            align === 'center' && 'mx-auto',
            align === 'left' && 'ml-0',
            align === 'right' && 'mr-0'
          )}>
            {subtitle}
          </p>
        )}
      </div>
    </AnimatedWrapper>
  )
}
