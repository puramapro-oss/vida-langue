'use client'

import { useEffect, useState } from 'react'

/**
 * Curseur lumineux émeraude (350px blur radial 12% opacity).
 * Hidden sur appareils tactiles via media query (pointer:coarse).
 * mix-blend-mode: screen pour fusionner naturellement avec le fond.
 */
export default function CursorGlow() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 })
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer:coarse)')
    if (mediaQuery.matches) return
    setEnabled(true)

    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  if (!enabled) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[1] h-[350px] w-[350px] rounded-full"
      style={{
        left: pos.x - 175,
        top: pos.y - 175,
        background:
          'radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 40%, transparent 70%)',
        filter: 'blur(40px)',
        mixBlendMode: 'screen',
        transition: 'transform 0.08s linear',
        willChange: 'left, top',
      }}
    />
  )
}
