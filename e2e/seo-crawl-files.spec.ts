import { test, expect, type Page } from '@playwright/test'
import { homeHeading } from './fixtures/home-copy'

const nonHomeRoutes = [
  '/about',
  '/contact',
  '/help-us',
  '/contribute',
  '/docs',
  '/docs/getting-started',
  '/docs/installing-packages',
  '/repositories',
  '/repositories/registry',
  '/accessibility',
  '/privacy',
  '/es/about',
  '/es/contribute',
] as const

async function waitForActiveServiceWorker(page: Page): Promise<void> {
  await expect
    .poll(
      async () =>
        page.evaluate(async () => {
          const registration = await navigator.serviceWorker.getRegistration()
          return registration?.active?.state ?? null
        }),
      { timeout: 15_000 },
    )
    .toBe('activated')
}

test.describe('SEO crawl files', () => {
  test('serves sitemap.xml as XML', async ({ request }) => {
    const response = await request.get('/sitemap.xml')

    await expect(response).toBeOK()

    const body = await response.text()
    expect(body).toContain('<urlset')
    expect(body).toContain('<loc>https://agents-repo.org/</loc>')

    for (const route of nonHomeRoutes) {
      expect(body).toContain(`${route}/</loc>`)
      expect(body).not.toContain(`${route}</loc>`)
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
    await expect(page.getByRole('heading', { name: homeHeading, level: 1 })).toBeVisible()
    await waitForActiveServiceWorker(page)
    await page.goto('/sitemap.xml')

    const content = await page.content()
    expect(content).toContain('<urlset')
    await expect(page.getByRole('heading', { name: homeHeading, level: 1 })).not.toBeVisible()
  })

  test('serves doc markdown and llms.txt as static files', async ({ request }) => {
    const markdownResponse = await request.get('/docs/getting-started.md')
    await expect(markdownResponse).toBeOK()
    const markdownBody = await markdownResponse.text()
    expect(markdownBody).toContain('Agents Repo')

    const contributingPackagesResponse = await request.get('/docs/contributing-packages.md')
    await expect(contributingPackagesResponse).toBeOK()
    const contributingPackagesBody = await contributingPackagesResponse.text()
    expect(contributingPackagesBody).toContain('package:validate')

    const llmsResponse = await request.get('/llms.txt')
    await expect(llmsResponse).toBeOK()
    const llmsBody = await llmsResponse.text()
    expect(llmsBody).toContain('https://agents-repo.org/docs/getting-started.md')
  })

  test('serves homepage noscript fallback and package markdown when built', async ({ request }) => {
    const homeResponse = await request.get('/')
    await expect(homeResponse).toBeOK()
    const homeBody = await homeResponse.text()
    expect(homeBody).toContain('id="static-route-fallback"')
    expect(homeBody).toContain('/llms.txt')

    const llmsResponse = await request.get('/llms.txt')
    await expect(llmsResponse).toBeOK()
    const llmsBody = await llmsResponse.text()
    const packageMarkdownMatch = llmsBody.match(
      /https:\/\/agents-repo\.org\/packages\/[^/\s]+\/[^/\s]+\.md/,
    )

    expect(packageMarkdownMatch).not.toBeNull()
    const packageMarkdownPath = packageMarkdownMatch![0].replace('https://agents-repo.org', '')

    const packageMarkdownResponse = await request.get(packageMarkdownPath)
    await expect(packageMarkdownResponse).toBeOK()
    const packageMarkdownBody = await packageMarkdownResponse.text()
    expect(packageMarkdownBody.startsWith('# ')).toBe(true)
  })

  test('does not redirect robots.txt to home when service worker is active', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: homeHeading, level: 1 })).toBeVisible()
    await waitForActiveServiceWorker(page)
    await page.goto('/robots.txt')

    const content = await page.content()
    expect(content).toContain('User-agent: *')
    expect(content).toContain('Sitemap: https://agents-repo.org/sitemap.xml')
    await expect(page.getByRole('heading', { name: homeHeading, level: 1 })).not.toBeVisible()
  })
})
