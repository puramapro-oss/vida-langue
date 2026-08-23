import { test, expect } from '@playwright/test'

// ─── 21 simulations utilisateur ──────────────────────────────────────────────

test.describe('Vida P6 — 21 simulations utilisateur', () => {
  test('SIM01 — visiteur arrive sur landing → voit hero VEDA', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toContainText('VEDA')
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
    await expect(page.locator('body')).toContainText(/VEDA|NAMA/)
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
    await expect(page.locator('body')).toContainText(/VEDA|Purama/)
  })

  test('SIM10 — visiteur consulte /how-it-works', async ({ page }) => {
    await page.goto('/how-it-works')
    await expect(page.locator('body')).toContainText(/VEDA|NAMA|Natif|HoloTalk/i)
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

// ─── Audit V5 — Nouvelles features ──────────────────────────────────────────

test.describe('Audit V5 — /financer', () => {
  test('Financer — page chargee + titre', async ({ page }) => {
    await page.goto('/financer')
    await expect(page.locator('body')).toContainText(/aides|financement|Trouvez/i)
  })

  test('Financer — wizard step 1 profil selectors visibles', async ({ page }) => {
    await page.goto('/financer')
    await expect(page.locator('[data-testid="profil-salarie"]')).toBeVisible()
    await expect(page.locator('[data-testid="situation-actif"]')).toBeVisible()
    await expect(page.locator('[data-testid="region-select"]')).toBeVisible()
    await expect(page.locator('[data-testid="btn-search-aides"]')).toBeVisible()
  })

  test('Financer — search button disabled sans profil+situation', async ({ page }) => {
    await page.goto('/financer')
    const btn = page.locator('[data-testid="btn-search-aides"]')
    await expect(btn).toBeDisabled()
  })

  test('Financer — API POST /api/financer → 200 avec aides', async ({ request }) => {
    const res = await request.post('/api/financer', {
      data: { profil: 'salarie', situation: 'actif' },
    })
    expect(res.status()).toBe(200)
    const json = await res.json() as { aides: unknown[]; cumul: number; total: number }
    expect(json.aides.length).toBeGreaterThan(0)
    expect(json.cumul).toBeGreaterThan(0)
  })

  test('Financer — API POST sans profil → 400', async ({ request }) => {
    const res = await request.post('/api/financer', {
      data: { situation: 'actif' },
    })
    expect(res.status()).toBe(400)
  })
})

test.describe('Audit V5 — /breathe', () => {
  test('Breathe — 3 patterns visibles', async ({ page }) => {
    await page.goto('/breathe')
    await expect(page.locator('[data-testid="pattern-coherence"]')).toBeVisible()
    await expect(page.locator('[data-testid="pattern-relaxing"]')).toBeVisible()
    await expect(page.locator('[data-testid="pattern-energizing"]')).toBeVisible()
  })

  test('Breathe — selectionner un pattern → bouton commencer', async ({ page }) => {
    await page.goto('/breathe')
    await page.locator('[data-testid="pattern-coherence"]').click()
    await expect(page.locator('[data-testid="btn-breathe-toggle"]')).toBeVisible()
  })
})

test.describe('Audit V5 — /pricing bandeau financer', () => {
  test('Pricing — bandeau financer visible avec lien', async ({ page }) => {
    await page.goto('/pricing')
    const banner = page.locator('[data-testid="banner-financer"]')
    await expect(banner).toBeVisible()
    await expect(banner).toContainText(/aides/i)
  })
})

test.describe('Audit V5 — API boutique', () => {
  test('GET /api/boutique → 200 + items', async ({ request }) => {
    const res = await request.get('/api/boutique')
    expect(res.status()).toBe(200)
    const json = await res.json() as { items: unknown[] }
    expect(json.items.length).toBeGreaterThan(0)
  })

  test('POST /api/boutique unauth → 401', async ({ request }) => {
    const res = await request.post('/api/boutique', { data: { item_id: 'fake' } })
    expect(res.status()).toBeGreaterThanOrEqual(400)
  })
})

test.describe('Audit V5 — API escalade', () => {
  test('POST /api/aide/escalade sans email → 400', async ({ request }) => {
    const res = await request.post('/api/aide/escalade', {
      data: { message: 'test' },
    })
    expect(res.status()).toBe(400)
  })
})

test.describe('Audit V5 — Dashboard auth gate nouvelles pages', () => {
  test('DASHBOARD /dashboard/gratitude → /login', async ({ page }) => {
    await page.goto('/dashboard/gratitude')
    await expect(page).toHaveURL(/\/login/)
  })

  test('DASHBOARD /dashboard/boutique → /login', async ({ page }) => {
    await page.goto('/dashboard/boutique')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Audit V5 — Responsive nouvelles pages', () => {
  for (const vp of [{ name: 'mobile-375', width: 375, height: 667 }]) {
    for (const path of ['/financer', '/breathe']) {
      test(`${path} @ ${vp.name} — no overflow`, async ({ page }) => {
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

test.describe('Audit V5 — 0 contenu factice', () => {
  for (const path of ['/', '/pricing', '/financer', '/breathe', '/aide']) {
    test(`${path} — 0 Lorem/TODO/AKASHA/faux`, async ({ page }) => {
      await page.goto(path)
      const body = (await page.locator('body').textContent()) || ''
      expect(body).not.toMatch(/Lorem/)
      expect(body).not.toMatch(/TODO/)
      expect(body).not.toMatch(/AKASHA/)
      expect(body).not.toMatch(/10\.000 utilisateurs/)
      expect(body).not.toMatch(/99%/)
    })
  }
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
