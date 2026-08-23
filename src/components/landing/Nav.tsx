'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Menu, X } from 'lucide-react'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-2xl bg-[rgba(4,10,7,0.72)] border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-[10px] bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center shadow-[0_0_20px_rgba(16,185,129,0.35)]">
              <Leaf className="h-4 w-4 text-emerald-950" strokeWidth={2.5} />
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">
              VEDA
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-[var(--text-secondary)]">
            <a href="#modes" className="hover:text-white transition-colors">Modes</a>
            <a href="#method" className="hover:text-white transition-colors">Méthode</a>
            <Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-white text-emerald-950 px-4 py-2 text-sm font-semibold hover:bg-emerald-50 transition-colors"
            >
              Commencer
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white"
            aria-label="Menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden backdrop-blur-2xl bg-[rgba(4,10,7,0.96)] border-t border-white/[0.06]"
          >
            <div className="flex flex-col gap-1 px-6 py-6">
              {[
                { href: '#modes', label: 'Modes' },
                { href: '#method', label: 'Méthode' },
                { href: '/pricing', label: 'Tarifs' },
                { href: '#faq', label: 'FAQ' },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-base text-white/90 hover:text-white"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="rounded-full border border-white/15 px-4 py-3 text-center text-sm text-white"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-white px-4 py-3 text-center text-sm font-semibold text-emerald-950"
                >
                  Commencer
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
