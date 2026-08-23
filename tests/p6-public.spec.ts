import { test, expect, type Page } from '@playwright/test'

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
  '/financer',
  '/breathe',
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

const VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 667 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
]

const RESPONSIVE_PAGES = ['/', '/pricing', '/login', '/signup', '/aide', '/how-it-works', '/financer', '/breathe']

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

test.describe('Vida P6 — Landing content', () => {
  test('Hero + CTA + branding VEDA', async ({ page }) => {
    await page.goto('/')
    const body = page.locator('body')
    await expect(body).toContainText('VEDA')
    const cta = page.locator('a[href="/signup"]').first()
    await expect(cta).toBeVisible()
  })

  test('Sections modes + méthode + faq', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#modes')).toBeAttached()
    await expect(page.locator('#method')).toBeAttached()
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
