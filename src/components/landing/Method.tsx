'use client'

import { useRef } from 'react'
import { motion, useScroll, useSpring, type MotionStyle } from 'framer-motion'

export default function Method() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.7', 'end 0.3'],
  })
  const lineHeight = useSpring(scrollYProgress, { stiffness: 80, damping: 20 })

  const steps = [
    { n: '01', title: 'Tu choisis une langue', desc: 'Parmi 50+. NAMA calibre la phonétique à ta langue maternelle.' },
    { n: '02', title: 'Tu ouvres un mode', desc: 'NeuroFlow le matin, HoloTalk à midi, SleepSync le soir. 5 à 30 min.' },
    { n: '03', title: 'Tu parles', desc: 'Jour 30 : tu commandes un café, tu négocies, tu flirtes. Dans leur langue.' },
  ] as const

  return (
    <section id="method" ref={containerRef} className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Trois étapes.<br />
            <span className="text-[var(--text-secondary)]">Aucune friction.</span>
          </h2>
        </div>

        <div className="relative mt-20">
          {/* Ligne verticale pointillée animée — visible md+ */}
          <div className="pointer-events-none absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-px md:block">
            <div className="h-full w-full border-l border-dashed border-white/10" />
            <motion.div
              aria-hidden
              className="absolute inset-x-0 top-0 origin-top"
              style={{
                scaleY: lineHeight as unknown as MotionStyle['scaleY'],
                background:
                  'linear-gradient(to bottom, rgba(16,185,129,0) 0%, rgba(16,185,129,0.6) 50%, rgba(6,182,212,0) 100%)',
                width: '2px',
                height: '100%',
                left: '-1px',
              }}
            />
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-xl"
              >
                <p className="font-[family-name:var(--font-display)] text-6xl font-bold leading-none tracking-tight text-emerald-400/90">
                  {s.n}
                </p>
                <h3 className="mt-5 text-xl font-semibold text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
