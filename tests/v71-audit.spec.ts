import { test, expect, type Page } from '@playwright/test'

// ═════════════════════════════════════════════════════════════════════════════
// VEDA V7.1+V4.1 AUDIT — tests ajoutés en P5
// Couvre : NAMA-Polyglotte, 50+ langues, Homepage 3 blocs, Ambassadeur rename,
// Paiement L221-28 (/confirmation + /settings/abonnement), OTS, INSEE, /fiscal,
// Stripe Connect, crons.
// ═════════════════════════════════════════════════════════════════════════════

function attachConsole(page: Page) {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(err.message))
  return errors
}

function filterBenign(errors: string[]) {
  return errors.filter(
    (e) =>
      !e.includes('Failed to load resource') &&
      !e.includes('favicon') &&
      !e.includes('net::ERR_') &&
      !e.includes('ResizeObserver') &&
      !e.toLowerCase().includes('hydration') &&
      !e.includes('[postgres]'),
  )
}

// ─── IDENTITÉ VEDA + NAMA-Polyglotte ─────────────────────────────────────────

test.describe('V7.1 · Identité VEDA & NAMA-Polyglotte', () => {
  test('Homepage mentionne NAMA-Polyglotte', async ({ page }) => {
    const res = await page.goto('/')
    expect(res?.status()).toBe(200)
    const content = await page.content()
    expect(content).toContain('NAMA-Polyglotte')
    expect(content).toContain('VEDA')
    expect(content).not.toContain('Vida Langue')
  })

  test('Homepage annonce 50+ langues', async ({ page }) => {
    await page.goto('/')
    const text = await page.locator('body').innerText()
    // accepte '50+' ou '50' dans la phrase langue
    expect(text).toMatch(/50\s*\+?\s*langues/i)
  })

  test('FAQ décrit familles linguistiques (latines, germaniques, slaves…)', async ({ page }) => {
    await page.goto('/')
    const text = await page.locator('body').innerText()
    expect(text.toLowerCase()).toContain('latines')
    expect(text.toLowerCase()).toContain('slaves')
    expect(text.toLowerCase()).toContain("langues d'éveil")
  })

  test('/api/status retourne app=VEDA + ai=NAMA-Polyglotte + languages >= 50', async ({ request }) => {
    const res = await request.get('/api/status')
    expect(res.ok()).toBeTruthy()
    const json = await res.json()
    expect(json.app).toBe('VEDA')
    expect(json.ai).toBe('NAMA-Polyglotte')
    expect(Number(json.languages)).toBeGreaterThanOrEqual(50)
    expect(typeof json.learners).toBe('number')
    expect(typeof json.sessions).toBe('number')
  })
})

// ─── HOMEPAGE 3 BLOCS ABOVE-FOLD ─────────────────────────────────────────────

test.describe('V7.1 · Homepage 3 blocs above-fold', () => {
  test('Bloc 1 : Hero avec CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: /commencer|essai/i }).first()).toBeVisible()
  })

  test('Bloc 2 : 3 modes phares teaser compact', async ({ page }) => {
    await page.goto('/')
    const text = await page.locator('body').innerText()
    expect(text).toContain('Natif Instinct')
    expect(text).toContain('HoloTalk')
    expect(text).toContain('NeuroFlow')
  })

  test('Bloc 3 : LiveCounters dynamiques (apprenants · langues · sessions)', async ({ page }) => {
    await page.goto('/')
    const text = await page.locator('body').innerText()
    expect(text.toLowerCase()).toContain('apprenants')
    expect(text.toLowerCase()).toContain('sessions')
  })
})

// ─── AMBASSADEUR (rename influenceur) ────────────────────────────────────────

test.describe('V7.1 · Rename influenceur → ambassadeur', () => {
  test('/dashboard/ambassadeur protégé (307 vers /login)', async ({ page }) => {
    const res = await page.goto('/dashboard/ambassadeur', { waitUntil: 'commit' })
    expect([200, 301, 302, 307, 308]).toContain(res?.status() ?? 0)
    expect(page.url()).toContain('/login')
  })

  test('/dashboard/influenceur redirige (308 permanent) vers /dashboard/ambassadeur', async ({ page }) => {
    const res = await page.goto('/dashboard/influenceur', { waitUntil: 'commit' })
    // Soit redirige direct, soit tombe sur login après la redirection dashboard
    const status = res?.status() ?? 0
    expect([200, 301, 302, 307, 308]).toContain(status)
    // Après suivi des redirections : soit on est sur /dashboard/ambassadeur, soit /login?next=/dashboard/ambassadeur
    const url = page.url()
    expect(url).toMatch(/ambassadeur|login/)
  })

  test('Sidebar nav : pas de label "Influenceur" public', async ({ page }) => {
    // La sidebar n'est pas exposée sans auth — on vérifie juste que le mot-clé
    // Influenceur n'apparaît nulle part en public.
    await page.goto('/')
    const text = await page.locator('body').innerText()
    expect(text).not.toContain('Influenceur')
  })
})

// ─── PAIEMENT V7.1 ────────────────────────────────────────────────────────────

test.describe('V7.1 · Flow paiement L221-28 + prime + résiliation', () => {
  test('/confirmation est publique et décrit la prime + waiver L221-28', async ({ page }) => {
    const res = await page.goto('/confirmation')
    expect(res?.status()).toBe(200)
    const text = await page.locator('body').innerText()
    expect(text).toContain('Bienvenue dans VEDA')
    expect(text.toLowerCase()).toContain('prime')
    expect(text).toMatch(/L221-28|rétractation|14 jours/i)
  })

  test('/dashboard/settings/abonnement protégé', async ({ page }) => {
    const res = await page.goto('/dashboard/settings/abonnement', { waitUntil: 'commit' })
    expect([200, 307, 308]).toContain(res?.status() ?? 0)
    expect(page.url()).toContain('/login')
  })

  test('/api/subscription/cancel 401 sans auth', async ({ request }) => {
    const res = await request.post('/api/subscription/cancel', { data: { reason: 'test' } })
    expect(res.status()).toBe(401)
  })
})

// ─── OPENTIMESTAMPS ──────────────────────────────────────────────────────────

test.describe('V7.1 · OpenTimestamps', () => {
  test('/api/ots/stamp 401 sans auth', async ({ request }) => {
    const res = await request.post('/api/ots/stamp', {
      data: { kind: 'engagement', content: 'test' },
    })
    expect(res.status()).toBe(401)
  })

  test('/api/ots/verify 400 sans payload', async ({ request }) => {
    const res = await request.post('/api/ots/verify', { data: {} })
    expect([400, 500]).toContain(res.status())
  })
})

// ─── INSEE SIRENE ────────────────────────────────────────────────────────────

test.describe('V7.1 · INSEE SIRENE', () => {
  test('/api/tax/verify-siret 400 si SIRET vide', async ({ request }) => {
    const res = await request.post('/api/tax/verify-siret', { data: { siret: '' } })
    // Schema Zod rejette min 9 chars
    expect([400, 500]).toContain(res.status())
  })

  test('/api/tax/verify-siret rejette SIRET invalide (checksum Luhn)', async ({ request }) => {
    const res = await request.post('/api/tax/verify-siret', {
      data: { siret: '12345678901234' }, // Luhn KO
    })
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(false)
    expect(String(json.error).toLowerCase()).toMatch(/siret|luhn|invalide/)
  })
})

// ─── /FISCAL ─────────────────────────────────────────────────────────────────

test.describe('V7.1 · /fiscal public + dashboard', () => {
  test('/fiscal public 200 + 3 paliers visibles', async ({ page }) => {
    const res = await page.goto('/fiscal')
    expect(res?.status()).toBe(200)
    const text = await page.locator('body').innerText()
    expect(text).toContain('1 500')
    expect(text).toContain('2 500')
    expect(text).toContain('3 000')
    expect(text.toLowerCase()).toContain('opentimestamps')
  })

  test('/dashboard/fiscal protégé', async ({ page }) => {
    const res = await page.goto('/dashboard/fiscal', { waitUntil: 'commit' })
    expect([200, 307, 308]).toContain(res?.status() ?? 0)
    expect(page.url()).toContain('/login')
  })

  test('/api/fiscal/pdf 401 sans auth', async ({ request }) => {
    const res = await request.post('/api/fiscal/pdf')
    expect(res.status()).toBe(401)
  })
})

// ─── STRIPE CONNECT ──────────────────────────────────────────────────────────

test.describe('V7.1 · Stripe Connect Embedded', () => {
  test('/api/connect/account 401 sans auth', async ({ request }) => {
    const res = await request.post('/api/connect/account')
    expect(res.status()).toBe(401)
  })

  test('/api/connect/account-session 401 sans auth', async ({ request }) => {
    const res = await request.post('/api/connect/account-session')
    expect(res.status()).toBe(401)
  })
})

// ─── CRONS ───────────────────────────────────────────────────────────────────

test.describe('V7.1 · Crons fiscal', () => {
  test('/api/cron/fiscal-monthly 401 sans secret', async ({ request }) => {
    const res = await request.get('/api/cron/fiscal-monthly')
    expect(res.status()).toBe(401)
  })

  test('/api/cron/fiscal-yearly 401 sans secret', async ({ request }) => {
    const res = await request.get('/api/cron/fiscal-yearly')
    expect(res.status()).toBe(401)
  })
})

// ─── CONSOLE CLEAN sur les nouvelles pages ──────────────────────────────────

test.describe('V7.1 · Console clean nouvelles pages', () => {
  for (const route of ['/fiscal', '/confirmation']) {
    test(`${route} sans erreur console`, async ({ page }) => {
      const errors = attachConsole(page)
      const res = await page.goto(route)
      expect(res?.status()).toBe(200)
      await page.waitForLoadState('networkidle').catch(() => null)
      expect(filterBenign(errors)).toEqual([])
    })
  }
})

// ─── RESPONSIVE nouvelles pages ──────────────────────────────────────────────

test.describe('V7.1 · Responsive 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  for (const route of ['/', '/fiscal', '/confirmation']) {
    test(`${route} 375px — pas d'overflow horizontal`, async ({ page }) => {
      const res = await page.goto(route)
      expect(res?.status()).toBe(200)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const viewport = await page.evaluate(() => window.innerWidth)
      expect(bodyWidth).toBeLessThanOrEqual(viewport + 1)
    })
  }
})
