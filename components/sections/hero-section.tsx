'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Container } from '@/components/container'
import { PremiumButton } from '@/components/premium-button'
import { HERO_CONTENT } from '@/lib/constants'
import { staggerContainer, fadeInUp, fadeIn, scaleUp, blurIn } from '@/lib/animations'

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="relative min-h-screen overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/images/hero-coffee.jpg"
          alt="Granos de café artesanal premium"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={90}
        />
        {/* Dark overlay - multiple layers for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/50" />
        {/* Vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </motion.div>

      {/* Content */}
      <Container className="relative z-10 flex min-h-screen flex-col justify-center pb-20 pt-32">
        <motion.div
          style={{ opacity }}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl"
        >
          {/* Eyebrow */}
          <motion.span
            variants={blurIn}
            className="mb-6 inline-block text-xs font-medium uppercase tracking-[0.4em] text-primary md:mb-8"
          >
            {HERO_CONTENT.eyebrow}
          </motion.span>

          {/* Main Headline */}
          <motion.h1
            variants={fadeInUp}
            className="font-serif text-5xl font-light leading-[1.05] text-foreground sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
          >
            {HERO_CONTENT.headline.split('\n').map((line, i) => (
              <span key={i} className="block">
                {i === 1 ? (
                  <span className="text-primary">{line}</span>
                ) : (
                  line
                )}
              </span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="mt-8 max-w-2xl text-base font-light leading-relaxed text-foreground/70 sm:text-lg md:mt-10 md:text-xl"
          >
            {HERO_CONTENT.subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6 md:mt-12"
          >
            <PremiumButton variant="primary" size="lg" href="/menu">
              {HERO_CONTENT.cta.primary}
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </PremiumButton>
            <PremiumButton variant="outline" size="lg" href="/nosotros">
              {HERO_CONTENT.cta.secondary}
            </PremiumButton>
          </motion.div>

          {/* Stats or trust indicators */}
          <motion.div
            variants={fadeIn}
            className="mt-16 flex flex-wrap gap-8 border-t border-border/30 pt-8 md:mt-20 md:gap-16"
          >
            <div>
              <span className="block font-serif text-3xl text-foreground md:text-4xl">15+</span>
              <span className="mt-1 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Orígenes de café
              </span>
            </div>
            <div>
              <span className="block font-serif text-3xl text-foreground md:text-4xl">100%</span>
              <span className="mt-1 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Artesanal
              </span>
            </div>
            <div>
              <span className="block font-serif text-3xl text-foreground md:text-4xl">5k+</span>
              <span className="mt-1 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Clientes felices
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 md:bottom-12"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Descubre más
            </span>
            <div className="h-12 w-px bg-gradient-to-b from-primary/50 to-transparent" />
          </motion.div>
        </motion.div>
      </Container>

      {/* Decorative elements */}
      <motion.div
        variants={scaleUp}
        initial="hidden"
        animate="visible"
        className="pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
      />
      <motion.div
        variants={scaleUp}
        initial="hidden"
        animate="visible"
        className="pointer-events-none absolute -left-32 bottom-1/4 h-64 w-64 rounded-full bg-accent/5 blur-3xl"
      />
      <motion.div
        variants={scaleUp}
        initial="hidden"
        animate="visible"
        className="pointer-events-none absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-primary/3 blur-2xl"
      />
    </section>
  )
}
