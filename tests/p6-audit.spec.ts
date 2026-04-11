import { test, expect, type Page, type Route } from '@playwright/test'

// ─── Public pages ─────────────────────────────────────────────────────────────

const PUBLIC_PAGES = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/pricing',
  '/onboarding',
  '/aide',
  '/contact',
  '/how-it-works',
  '/ecosystem',
  '/status',
  '/changelog',
  '/cookies',
  '/cgu',
  '/cgv',
  '/mentions-legales',
  '/politique-confidentialite',
  '/offline',
]

function attachConsole(page: Page) {
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', err => errors.push(err.message))
  return errors
}

function filterBenign(errors: string[]) {
  return errors.filter(e =>
    !e.includes('Failed to load resource') &&
    !e.includes('favicon') &&
    !e.includes('manifest') &&
    !e.includes('hydrat') &&
    !e.includes('Warning:') &&
    !e.includes('net::') &&
    !e.includes('Refused to') &&
    !e.toLowerCase().includes('preload') &&
    !e.toLowerCase().includes('posthog'),
  )
}

test.describe('Vida P6 — Pages publiques', () => {
  for (const path of PUBLIC_PAGES) {
    test(`PUBLIC ${path} → 200 + console clean`, async ({ page }) => {
      const errors = attachConsole(page)
      const res = await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 20000 })
      expect(res?.status(), `${path} status`).toBeLessThan(400)
      const body = await page.locator('body').textContent()
      expect(body && body.length, `${path} body length`).toBeGreaterThan(50)
      const real = filterBenign(errors)
      expect(real, `console errors on ${path}: ${real.join(' | ')}`).toHaveLength(0)
    })
  }
})

// ─── Dashboard auth gate ─────────────────────────────────────────────────────

const DASHBOARD_PAGES = [
  '/dashboard',
  '/dashboard/sessions',
  '/dashboard/sessions/natif-instinct',
  '/dashboard/sessions/holotalk',
  '/dashboard/sessions/neuroflow',
  '/dashboard/sessions/sleep',
  '/dashboard/sessions/hypno',
  '/dashboard/sessions/reality',
  '/dashboard/sessions/group',
  '/dashboard/sessions/spiritual',
  '/dashboard/missions',
  '/dashboard/univers',
  '/dashboard/impact',
  '/dashboard/wallet',
  '/dashboard/referral',
  '/dashboard/influenceur',
  '/dashboard/guide',
  '/dashboard/profile',
  '/dashboard/settings',
  '/dashboard/admin',
  '/dashboard/invoices',
  '/dashboard/notifications',
  '/dashboard/concours',
  '/dashboard/tirage',
  '/dashboard/partage',
  '/dashboard/achievements',
  '/dashboard/classement',
  '/dashboard/daily-gift',
]

test.describe('Vida P6 — Dashboard auth gate', () => {
  for (const path of DASHBOARD_PAGES) {
    test(`DASHBOARD ${path} → /login`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 20000 })
      expect(page.url(), `${path} should redirect to login`).toMatch(/\/login/)
    })
  }
})

// ─── Responsive: no overflow ─────────────────────────────────────────────────

const VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 667 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
]

const RESPONSIVE_PAGES = ['/', '/pricing', '/login', '/signup', '/aide', '/how-it-works']

test.describe('Vida P6 — Responsive (no horizontal overflow)', () => {
  for (const vp of VIEWPORTS) {
    for (const path of RESPONSIVE_PAGES) {
      test(`${path} @ ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 20000 })
        const overflow = await page.evaluate(() =>
          document.documentElement.scrollWidth > window.innerWidth + 2,
        )
        expect(overflow, `horizontal overflow at ${vp.width}px on ${path}`).toBe(false)
      })
    }
  }
})

// ─── API routes ──────────────────────────────────────────────────────────────

test.describe('Vida P6 — API routes', () => {
  test('GET /api/status → 200 ok', async ({ request }) => {
    const res = await request.get('/api/status')
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('ok')
  })

  test('GET /api/og?title=Test → 200 image', async ({ request }) => {
    const res = await request.get('/api/og?title=Vida')
    expect(res.status()).toBe(200)
    const ct = res.headers()['content-type'] || ''
    expect(ct).toContain('image')
  })

  test('GET /sitemap.xml → 200 + xml + vidalangue', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.status()).toBe(200)
    const text = await res.text()
    expect(text).toContain('<?xml')
    expect(text.toLowerCase()).toContain('vidalangue')
  })

  test('GET /robots.txt → 200', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(res.status()).toBe(200)
  })

  test('GET /manifest.json → Vida Langue', async ({ request }) => {
    const res = await request.get('/manifest.json')
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.name).toMatch(/Vida/i)
    expect(json.theme_color).toBe('#10B981')
  })

  test('POST /api/locale switch fr', async ({ request }) => {
    const res = await request.post('/api/locale', { data: { locale: 'fr' } })
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.locale).toBe('fr')
    expect(json.success).toBe(true)
  })

  test('POST /api/locale invalid → 400', async ({ request }) => {
    const res = await request.post('/api/locale', { data: { locale: 'xx' } })
    expect(res.status()).toBe(400)
  })

  test('POST /api/holotalk unauth → 401', async ({ request }) => {
    const res = await request.post('/api/holotalk', {
      data: { messages: [{ role: 'user', content: 'hi' }], persona: 'sofia' },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
  })

  test('POST /api/phonetic unauth → 401', async ({ request }) => {
    const res = await request.post('/api/phonetic', {
      data: { phrase: 'hola', target_lang: 'es', native_lang: 'fr' },
    })
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
  })

  test('GET /api/referral unauth → 401', async ({ request }) => {
    const res = await request.get('/api/referral')
    expect(res.status()).toBeGreaterThanOrEqual(400)
    expect(res.status()).toBeLessThan(500)
  })
})

// ─── Forms / interactivité ───────────────────────────────────────────────────

test.describe('Vida P6 — Forms', () => {
  test('Login — inputs typeable + bouton', async ({ page }) => {
    await page.goto('/login')
    const email = page.locator('[data-testid="email-input"]')
    const pass = page.locator('[data-testid="password-input"]')
    await expect(email).toBeVisible()
    await expect(pass).toBeVisible()
    await email.fill('test@vida.dev')
    await pass.fill('Test1234!')
    await expect(email).toHaveValue('test@vida.dev')
    await expect(pass).toHaveValue('Test1234!')
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="google-login"]')).toBeVisible()
  })

  test('Signup — tous champs + cgu + bouton', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('[data-testid="name-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="cgu-checkbox"]')).toBeVisible()
    await expect(page.locator('[data-testid="signup-button"]')).toBeVisible()
  })

  test('Contact — page rendue', async ({ page }) => {
    await page.goto('/contact')
    const body = page.locator('body')
    await expect(body).toContainText(/Contact/i)
  })

  test('Aide — coach Vida présent', async ({ page }) => {
    await page.goto('/aide')
    const body = page.locator('body')
    await expect(body).toContainText(/Vida/i)
  })
})

// ─── Landing content ─────────────────────────────────────────────────────────

test.describe('Vida P6 — Landing content', () => {
  test('Hero + CTA + branding Vida', async ({ page }) => {
    await page.goto('/')
    const body = page.locator('body')
    await expect(body).toContainText('Vida Langue')
    const cta = page.locator('a[href="/signup"]').first()
    await expect(cta).toBeVisible()
  })

  test('Sections phonetic + modes + impact + faq', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#phonetic')).toBeAttached()
    await expect(page.locator('#modes')).toBeAttached()
    await expect(page.locator('#impact')).toBeAttached()
    await expect(page.locator('#faq')).toBeAttached()
  })

  test('Footer SASU PURAMA art. 293 B', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    await expect(footer).toContainText('SASU PURAMA')
    await expect(footer).toContainText('293')
  })

  test('Pricing — 3 offres Vida (mensuel/annuel/à vie)', async ({ page }) => {
    await page.goto('/pricing')
    const body = page.locator('body')
    await expect(body).toContainText(/12[,.]?90|Mensuel/i)
    await expect(body).toContainText(/Annuel|108/i)
  })

  test('Aucun "AKASHA" résiduel sur landing', async ({ page }) => {
    await page.goto('/')
    const body = (await page.locator('body').textContent()) || ''
    expect(body).not.toMatch(/AKASHA/)
  })

  test('Aucun "AKASHA" résiduel sur pricing', async ({ page }) => {
    await page.goto('/pricing')
    const body = (await page.locator('body').textContent()) || ''
    expect(body).not.toMatch(/AKASHA/)
  })
})

// ─── 21 simulations utilisateur ──────────────────────────────────────────────

test.describe('Vida P6 — 21 simulations utilisateur', () => {
  test('SIM01 — visiteur arrive sur landing → voit hero Vida', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toContainText('Vida Langue')
  })

  test('SIM02 — visiteur clique CTA → /signup', async ({ page }) => {
    await page.goto('/')
    await page.locator('a[href="/signup"]').first().click()
    await expect(page).toHaveURL(/\/signup/)
  })

  test('SIM03 — visiteur va voir tarifs', async ({ page }) => {
    await page.goto('/')
    await page.locator('a[href="/pricing"]').first().click()
    await expect(page).toHaveURL(/\/pricing/)
  })

  test('SIM04 — visiteur scroll vers FAQ via ancre', async ({ page }) => {
    await page.goto('/#faq')
    await expect(page.locator('#faq')).toBeAttached()
  })

  test('SIM05 — visiteur ouvre /aide pour chercher aide', async ({ page }) => {
    await page.goto('/aide')
    await expect(page.locator('body')).toContainText(/Vida/)
  })

  test('SIM06 — visiteur va sur /contact', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.locator('body')).toContainText(/Contact/i)
  })

  test('SIM07 — visiteur consulte CGU + CGV + mentions', async ({ page }) => {
    for (const p of ['/cgu', '/cgv', '/mentions-legales']) {
      const res = await page.goto(p)
      expect(res?.status()).toBeLessThan(400)
    }
  })

  test('SIM08 — visiteur consulte politique de confidentialité + cookies', async ({ page }) => {
    for (const p of ['/politique-confidentialite', '/cookies']) {
      const res = await page.goto(p)
      expect(res?.status()).toBeLessThan(400)
    }
  })

  test('SIM09 — visiteur va sur /ecosystem (cross-promo)', async ({ page }) => {
    await page.goto('/ecosystem')
    await expect(page.locator('body')).toContainText(/Vida/)
  })

  test('SIM10 — visiteur consulte /how-it-works', async ({ page }) => {
    await page.goto('/how-it-works')
    await expect(page.locator('body')).toContainText(/Vida|Natif|HoloTalk/i)
  })

  test('SIM11 — visiteur essaie de forcer /dashboard sans auth → /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('SIM12 — visiteur essaie /dashboard/wallet sans auth → /login', async ({ page }) => {
    await page.goto('/dashboard/wallet')
    await expect(page).toHaveURL(/\/login/)
  })

  test('SIM13 — visiteur essaie /dashboard/admin sans auth → /login', async ({ page }) => {
    await page.goto('/dashboard/admin')
    await expect(page).toHaveURL(/\/login/)
  })

  test('SIM14 — visiteur tape mot de passe court signup → strength feedback', async ({ page }) => {
    await page.goto('/signup')
    const pass = page.locator('[data-testid="password-input"]')
    await pass.fill('abc')
    const body = await page.locator('body').textContent()
    expect(body).toMatch(/Faible|Moyen|Fort|Excellent|Trop court|caractères/i)
  })

  test('SIM15 — visiteur change locale via API', async ({ request }) => {
    const res = await request.post('/api/locale', { data: { locale: 'en' } })
    expect(res.status()).toBe(200)
  })

  test('SIM16 — visiteur ouvre lien parrainage /go/[code] (code inconnu → home)', async ({ page }) => {
    const res = await page.goto('/go/test-code-fake')
    // Code inconnu → redirect home (200), code valide → /signup?ref=
    expect(res?.status()).toBeLessThan(400)
    expect(page.url()).toMatch(/(\/$|\/signup)/)
  })

  test('SIM17 — visiteur sur mobile (375px) — landing scrollable sans overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > window.innerWidth + 2,
    )
    expect(overflow).toBe(false)
  })

  test('SIM18 — visiteur sur tablette (768px) — pricing OK', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/pricing')
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > window.innerWidth + 2,
    )
    expect(overflow).toBe(false)
  })

  test('SIM19 — visiteur teste status API', async ({ request }) => {
    const res = await request.get('/api/status')
    expect(res.status()).toBe(200)
    const j = await res.json()
    expect(j.status).toBe('ok')
  })

  test('SIM20 — visiteur teste sitemap (SEO)', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.status()).toBe(200)
    const text = await res.text()
    expect(text).toContain('vidalangue')
  })

  test('SIM21 — visiteur teste OG image (partage social)', async ({ request }) => {
    const res = await request.get('/api/og?title=Vida%20Langue')
    expect(res.status()).toBe(200)
    const ct = res.headers()['content-type'] || ''
    expect(ct).toMatch(/image/)
  })
})

// ─── Liens morts (boutons header / footer) ──────────────────────────────────

test.describe('Vida P6 — Liens internes morts', () => {
  test('Tous liens internes du landing répondent < 400', async ({ page, request }) => {
    await page.goto('/')
    const hrefs = await page.$$eval('a[href]', as =>
      Array.from(new Set(
        as.map(a => (a as HTMLAnchorElement).getAttribute('href') || '')
          .filter(h => h.startsWith('/') && !h.startsWith('//') && !h.includes('#')),
      )),
    )
    for (const href of hrefs) {
      const res = await request.get(href, { failOnStatusCode: false })
      expect(res.status(), `${href} doit être < 400`).toBeLessThan(400)
    }
  })
})
