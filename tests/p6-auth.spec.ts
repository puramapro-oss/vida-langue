import { test, expect } from '@playwright/test'

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
  '/dashboard/gratitude',
  '/dashboard/boutique',
]

test.describe('Vida P6 — Dashboard auth gate', () => {
  for (const path of DASHBOARD_PAGES) {
    test(`DASHBOARD ${path} → /login`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 20000 })
      expect(page.url(), `${path} should redirect to login`).toMatch(/\/login/)
    })
  }
})

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

  test('Aide — coach VEDA/NAMA présent', async ({ page }) => {
    await page.goto('/aide')
    const body = page.locator('body')
    await expect(body).toContainText(/VEDA|NAMA/i)
  })
})
