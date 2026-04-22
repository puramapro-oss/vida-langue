import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Toaster } from 'sonner'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import CookieBanner from '@/components/shared/CookieBanner'
import CursorGlow from '@/components/layout/CursorGlow'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'VEDA — Deviens fluide à l\'oral en 30 jours.',
  description: 'La première app qui grave les langues dans ton cerveau. Guidé par NAMA-Polyglotte : phonétique 3 couches neuro-adaptative, HoloTalk vocal, 50+ langues. Essai 14 jours offert.',
  metadataBase: new URL('https://vidalangue.purama.dev'),
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'VEDA — Parle une langue en 30 jours.',
    description: 'Phonétique VEDA neuro-adaptative + HoloTalk vocal + NeuroFlow. Essai 14 jours offert.',
    url: 'https://vidalangue.purama.dev',
    siteName: 'VEDA',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'VEDA — Parle une langue en 30 jours',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VEDA — Parle une langue en 30 jours.',
    description: 'Phonétique neuro-adaptée + conversations vocales + impact réel. Essai 14 jours.',
    images: ['/api/og'],
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://vidalangue.purama.dev',
  },
}

export const viewport: Viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('vida-langue-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}else{document.documentElement.dataset.theme='dark'}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-void)] font-[family-name:var(--font-body)] text-[var(--text-primary)] antialiased">
        <div className="aurora" />
        <div className="grid-overlay" />
        <div className="noise-overlay" />
        <CursorGlow />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <CookieBanner />
        </NextIntlClientProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(16,185,129,0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(167,243,208,0.15)',
              color: '#ecfdf5',
            },
          }}
        />
      </body>
    </html>
  )
}
