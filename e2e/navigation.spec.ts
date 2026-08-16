import { test, expect } from './fixtures/registry-mock'

const routeHeadings = [
  { path: '/', heading: 'Explore ready-to-use agents and flows' },
  { path: '/packages', heading: 'All packages' },
  { path: '/about', heading: 'About' },
  { path: '/community', heading: 'Community' },
  { path: '/contact', heading: 'Contact' },
  { path: '/help-us', heading: 'Help Us' },
  { path: '/repositories', heading: 'Repositories' },
  { path: '/repositories/registry', heading: 'Registry' },
  { path: '/accessibility', heading: 'Accessibility statement' },
  { path: '/privacy', heading: 'Privacy policy' },
  { path: '/privacidade', heading: 'Política de privacidade' },
] as const

test.describe('Navigation', () => {
  for (const { path, heading } of routeHeadings) {
    test(`renders ${path}`, async ({ page }) => {
      await page.goto(path)

      await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible()
    })
  }

  test('redirects unknown paths to home', async ({ page }) => {
    await page.goto('/unknown-route')

    await expect(
      page.getByRole('heading', { name: 'Explore ready-to-use agents and flows' }),
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
      page.getByRole('heading', { name: 'Explore ready-to-use agents and flows' }),
    ).toHaveCount(0)
  })

  test('redirects nested unknown repository paths to the repositories index', async ({ page }) => {
    await page.goto('/repositories/foo/bar')

    await expect(page.getByRole('heading', { name: 'Repositories', level: 1 })).toBeVisible()
  })
})
