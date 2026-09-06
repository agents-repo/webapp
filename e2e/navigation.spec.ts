import { test, expect } from './fixtures/registry-mock'
import { waitForCatalogSettled } from './fixtures/catalog-load'

const routeHeadings = [
  { path: '/', heading: 'Ready-to-use agents and flows for Copilot, Cursor, Claude Code, and Codex' },
  { path: '/packages', heading: 'All packages' },
  { path: '/about', heading: 'About' },
  { path: '/community', heading: 'Community' },
  { path: '/contact', heading: 'Contact' },
  { path: '/help-us', heading: 'Help Us' },
  { path: '/repositories', heading: 'Repositories' },
  { path: '/repositories/registry', heading: 'Registry' },
  { path: '/accessibility', heading: 'Accessibility statement' },
  { path: '/privacy', heading: 'Privacy policy' },
] as const

test.describe('Navigation', () => {
  for (const { path, heading } of routeHeadings) {
    test(`renders ${path}`, async ({ page }) => {
      await page.goto(path)

      await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible()
    })
  }

  test('renders /es/about with Spanish locale prefix', async ({ page }) => {
    await page.goto('/es/about/')

    await expect(page.getByRole('heading', { name: 'Acerca de', level: 1 })).toBeVisible()
  })

  test('redirects legacy /privacidade to localized pt-BR privacy', async ({ page }) => {
    await page.goto('/privacidade')

    await expect(page).toHaveURL(/\/pt-br\/privacy\/?$/)
    await expect(page.getByRole('heading', { name: 'Política de privacidade', level: 1 })).toBeVisible()
  })

  test('redirects unknown paths to home', async ({ page }) => {
    await page.goto('/unknown-route')

    await expect(
      page.getByRole('heading', { name: 'Ready-to-use agents and flows for Copilot, Cursor, Claude Code, and Codex' }),
    ).toBeVisible()
  })

  test('redirects unknown repository slugs to the repositories index', async ({ page }) => {
    await page.goto('/repositories/not-a-real-slug')

    await expect(page.getByRole('heading', { name: 'Repositories', level: 1 })).toBeVisible()
  })

  test('shows not-found for unknown package paths instead of redirecting home', async ({ page }) => {
    await page.goto('/packages/not-a-real-namespace/not-a-real-package')

    await expect(page.getByRole('heading', { name: 'Package not found', level: 1 })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Ready-to-use agents and flows for Copilot, Cursor, Claude Code, and Codex' }),
    ).toHaveCount(0)
  })

  test('redirects nested unknown repository paths to the repositories index', async ({ page }) => {
    await page.goto('/repositories/foo/bar')

    await expect(page.getByRole('heading', { name: 'Repositories', level: 1 })).toBeVisible()
  })

  test('resets window scroll when navigating to another page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 360 })
    await page.goto('/')
    await waitForCatalogSettled(page)
    await page.getByRole('heading', { name: 'sample-agent' }).scrollIntoViewIfNeeded()
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Packages' }).click()

    await expect(page.getByRole('heading', { name: 'All packages', level: 1 })).toBeVisible()
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBe(0)
  })
})
