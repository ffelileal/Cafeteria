'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { fadeInUp, fadeIn, scaleUp, staggerContainer, slideInLeft, slideInRight } from '@/lib/animations'

type AnimationType = 'fadeInUp' | 'fadeIn' | 'scaleUp' | 'slideInLeft' | 'slideInRight' | 'stagger'

interface AnimatedWrapperProps {
  children: ReactNode
  animation?: AnimationType
  className?: string
  delay?: number
  once?: boolean
  amount?: number
}

const animations = {
  fadeInUp,
  fadeIn,
  scaleUp,
  slideInLeft,
  slideInRight,
  stagger: staggerContainer,
}

export function AnimatedWrapper({
  children,
  animation = 'fadeInUp',
  className = '',
  delay = 0,
  once = true,
  amount = 0.3,
}: AnimatedWrapperProps) {
  const selectedAnimation = animations[animation]

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={selectedAnimation}
      className={className}
      custom={delay}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  )
}
