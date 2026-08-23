'use client'

import { useState, useEffect } from 'react'
import AnimatedCounter from './AnimatedCounter'

export default function LiveStats() {
  const [stats, setStats] = useState<{ learners: number; languages: number; sessions: number } | null>(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/status', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!mounted || !data) return
        setStats({
          learners: Number(data.learners ?? 0),
          languages: Number(data.languages ?? 50),
          sessions: Number(data.sessions ?? 0),
        })
      })
      .catch(() => {
        if (!mounted) return
        setStats({ learners: 0, languages: 50, sessions: 0 })
      })
    return () => { mounted = false }
  }, [])

  const learners = stats?.learners ?? 0
  const languages = stats?.languages ?? 50
  const sessions = stats?.sessions ?? 0

  return (
    <div className="mt-12 grid grid-cols-3 gap-4 text-center sm:gap-8">
      <div>
        <div className="font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
          <AnimatedCounter value={learners} />
        </div>
        <p className="mt-1 text-xs uppercase tracking-wider text-[var(--text-muted)]">Apprenants</p>
      </div>
      <div>
        <div className="font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
          <AnimatedCounter value={languages} suffix="+" />
        </div>
        <p className="mt-1 text-xs uppercase tracking-wider text-[var(--text-muted)]">Langues</p>
      </div>
      <div>
        <div className="font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
          <AnimatedCounter value={sessions} />
        </div>
        <p className="mt-1 text-xs uppercase tracking-wider text-[var(--text-muted)]">Sessions guidées</p>
      </div>
    </div>
  )
}
