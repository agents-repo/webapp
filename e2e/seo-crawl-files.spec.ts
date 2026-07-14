import { test, expect } from './fixtures/registry-mock'

test.describe('SEO crawl files', () => {
  test('serves sitemap.xml as XML', async ({ request }) => {
    const response = await request.get('/sitemap.xml')

    await expect(response).toBeOK()

    const body = await response.text()
    expect(body).toContain('<urlset')
    expect(body).toContain('https://agents-repo.org/about</loc>')
  })

  test('does not redirect sitemap.xml to home when service worker is active', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.goto('/sitemap.xml')

    const content = await page.content()
    expect(content).toContain('<urlset')
    await expect(
      page.getByRole('heading', { name: 'Explore ready-to-use agents and flows' }),
    ).not.toBeVisible()
  })
})
