import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/config'

const PUBLIC_PATHS = [
  '/', '/pricing', '/how-it-works', '/ecosystem', '/status', '/changelog',
  '/privacy', '/terms', '/legal', '/offline', '/login', '/signup', '/register',
  '/onboarding', '/mentions-legales', '/politique-confidentialite', '/cgv', '/cgu',
  '/aide', '/contact', '/financer', '/breathe', '/fiscal', '/confirmation',
]

function isPublicPath(pathname: string): boolean {
  // strip locale prefix if present
  const pathWithoutLocale = pathname.replace(/^\/(fr|en|es|de|it|pt|ar|zh|ja|ko|hi|ru|tr|nl|pl|sv)(\/|$)/, '/')

  if (PUBLIC_PATHS.includes(pathWithoutLocale)) return true
  if (pathWithoutLocale.startsWith('/go/')) return true
  if (pathWithoutLocale.startsWith('/p/')) return true
  if (pathWithoutLocale.startsWith('/share/')) return true
  if (pathWithoutLocale.startsWith('/scan/')) return true
  if (pathWithoutLocale.startsWith('/api/')) return true
  if (pathWithoutLocale.startsWith('/_next/')) return true
  if (pathWithoutLocale.startsWith('/auth/')) return true
  if (pathWithoutLocale.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|json|xml|txt)$/)) return true
  if (pathWithoutLocale === '/sitemap.xml' || pathWithoutLocale === '/robots.txt' || pathWithoutLocale === '/manifest.json') return true
  if (pathWithoutLocale === '/cookies') return true
  return false
}

// next-intl i18n middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // skip i18n for api/static/assets
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|json|xml|txt)$/) ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/manifest.json'
  ) {
    return NextResponse.next()
  }

  // i18n routing first
  const intlResponse = intlMiddleware(request)
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse
  }

  // intlResponse is NextResponse — clone for supabase
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
