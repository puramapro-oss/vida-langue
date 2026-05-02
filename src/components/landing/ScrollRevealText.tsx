'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

interface ScrollRevealTextProps {
  text: string
  className?: string
}

interface WordProps {
  children: string
  progress: MotionValue<number>
  range: [number, number]
}

function Word({ children, progress, range }: WordProps) {
  const opacity = useTransform(progress, range, [0.18, 1])
  const color = useTransform(progress, range, ['#4b5563', '#ffffff'])
  return (
    <motion.span
      style={{ opacity, color }}
      className="inline-block transition-colors"
    >
      {children}
      <span> </span>
    </motion.span>
  )
}

/**
 * Phrase qui se révèle au scroll : chaque mot transitionne gris → blanc selon progression.
 * Effet Apple "Made on a Mac" / "Designed by Apple".
 */
export default function ScrollRevealText({ text, className = '' }: ScrollRevealTextProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'start 0.25'],
  })

  const words = text.split(' ')

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const start = i / words.length
        const end = start + 1 / words.length
        return (
          <Word key={`${word}-${i}`} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        )
      })}
    </p>
  )
}
