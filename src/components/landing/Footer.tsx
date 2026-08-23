import Link from 'next/link'
import { Leaf } from 'lucide-react'
import NewsletterForm from './NewsletterForm'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center">
                <Leaf className="h-3.5 w-3.5 text-emerald-950" strokeWidth={2.5} />
              </div>
              <span className="font-[family-name:var(--font-display)] text-base font-bold tracking-tight text-white">
                VEDA
              </span>
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-[var(--text-muted)]">
              Parle une langue en 30 jours. Sans cours, sans stress, sans théorie.
            </p>
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white">
                Newsletter
              </p>
              <NewsletterForm />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Produit</p>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--text-secondary)]">
              <li><a href="#modes" className="hover:text-white transition-colors">Modes</a></li>
              <li><a href="#method" className="hover:text-white transition-colors">Méthode</a></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">Comment ça marche</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Aide</p>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--text-secondary)]">
              <li><Link href="/aide" className="hover:text-white transition-colors">Centre d&apos;aide</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/status" className="hover:text-white transition-colors">Statut</Link></li>
              <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white">Légal</p>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--text-secondary)]">
              <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
              <li><Link href="/politique-confidentialite" className="hover:text-white transition-colors">Confidentialité</Link></li>
              <li><Link href="/cgv" className="hover:text-white transition-colors">CGV</Link></li>
              <li><Link href="/cgu" className="hover:text-white transition-colors">CGU</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.06] pt-8 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} VEDA — SASU PURAMA. TVA non applicable, art. 293 B du CGI.</p>
          <p>Frasne, France · Fait avec 🌱</p>
        </div>
      </div>
    </footer>
  )
}
