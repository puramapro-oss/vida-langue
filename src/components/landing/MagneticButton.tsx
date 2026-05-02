'use client'

import { useRef, type ReactNode, type MouseEvent } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
  onClick?: () => void
  href?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  ariaLabel?: string
  asLink?: boolean
}

/**
 * Bouton magnétique premium : suit le curseur avec un spring naturel.
 * Stiffness 150, damping 15, force 0.3 par défaut.
 */
export default function MagneticButton({
  children,
  className,
  strength = 0.3,
  onClick,
  href,
  type = 'button',
  disabled,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
  const x = useSpring(0, { stiffness: 150, damping: 15, mass: 0.5 })
  const y = useSpring(0, { stiffness: 150, damping: 15, mass: 0.5 })

  // Eviter "x value is read-only" warnings via useTransform passthrough
  const tx = useTransform(x, (v) => v)
  const ty = useTransform(y, (v) => v)

  function handleMove(e: MouseEvent<HTMLElement>) {
    if (!ref.current || disabled) return
    const rect = ref.current.getBoundingClientRect()
    const offsetX = (e.clientX - rect.left - rect.width / 2) * strength
    const offsetY = (e.clientY - rect.top - rect.height / 2) * strength
    x.set(offsetX)
    y.set(offsetY)
  }

  function handleLeave() {
    x.set(0)
    y.set(0)
  }

  const sharedClass = cn('magnetic-btn inline-flex items-center justify-center', className)

  if (href) {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={onClick}
        aria-label={ariaLabel}
        style={{ x: tx, y: ty }}
        className={sharedClass}
      >
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{ x: tx, y: ty }}
      className={sharedClass}
    >
      {children}
    </motion.button>
  )
}
