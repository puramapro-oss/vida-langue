import { test, expect } from '@playwright/test'

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

  test('GET /manifest.json → VEDA', async ({ request }) => {
    const res = await request.get('/manifest.json')
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.name).toMatch(/VEDA/i)
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
