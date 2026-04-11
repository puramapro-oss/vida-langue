import { test, expect } from '@playwright/test'

// Refonte 2026-04-11 — vérifie 0 overflow horizontal sur les pages clés à 4 breakpoints
const VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
]

const PAGES = ['/', '/login', '/signup', '/pricing']

for (const viewport of VIEWPORTS) {
  test.describe(`viewport ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    for (const path of PAGES) {
      test(`${path} no horizontal overflow`, async ({ page }) => {
        const errors: string[] = []
        page.on('pageerror', (e) => errors.push(e.message))
        page.on('console', (msg) => {
          if (msg.type() === 'error') errors.push(msg.text())
        })

        const resp = await page.goto(path, { waitUntil: 'networkidle' })
        expect(resp?.status()).toBe(200)

        // Check for horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
        })
        expect(hasHorizontalScroll, `Page ${path} has horizontal overflow at ${viewport.width}px`).toBe(false)

        // No JS console errors
        expect(errors.filter((e) => !e.includes('favicon') && !e.includes('manifest'))).toEqual([])
      })
    }
  })
}
