import { test, expect } from './fixtures/registry-mock'

const nonHomeRoutes = [
  '/about',
  '/contact',
  '/help-us',
  '/accessibility',
  '/privacy',
  '/privacidade',
] as const

const homeHeading = 'Explore ready-to-use agents and flows'

test.describe('SEO crawl files', () => {
  test('serves sitemap.xml as XML', async ({ request }) => {
    const response = await request.get('/sitemap.xml')

    await expect(response).toBeOK()

    const body = await response.text()
    expect(body).toContain('<urlset')
    expect(body).toContain('<loc>https://agents-repo.org/</loc>')

    for (const route of nonHomeRoutes) {
      expect(body).toContain(`${route}</loc>`)
    }
  })

  test('serves robots.txt as plain text', async ({ request }) => {
    const response = await request.get('/robots.txt')

    await expect(response).toBeOK()

    const body = await response.text()
    expect(body).toContain('User-agent: *')
    expect(body).toContain('Sitemap: https://agents-repo.org/sitemap.xml')
  })

  test('does not redirect sitemap.xml to home when service worker is active', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.goto('/sitemap.xml')

    const content = await page.content()
    expect(content).toContain('<urlset')
    await expect(page.getByRole('heading', { name: homeHeading, level: 1 })).not.toBeVisible()
  })

  test('does not redirect robots.txt to home when service worker is active', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.goto('/robots.txt')

    const content = await page.content()
    expect(content).toContain('User-agent: *')
    expect(content).toContain('Sitemap: https://agents-repo.org/sitemap.xml')
    await expect(page.getByRole('heading', { name: homeHeading, level: 1 })).not.toBeVisible()
  })
})
