import type { Page } from '@playwright/test'
import { test, expect } from './fixtures/registry-mock'

const homeHeading = 'Explore ready-to-use agents and flows'

function primaryNav(page: Page) {
  return page.getByRole('navigation', { name: 'Primary' })
}

test.describe('Primary header', () => {
  // Desktop Chrome is already above `lg` (992px). This spec covers the About
  // dropdown path, not the collapsed hamburger list.

  test('returns home from the brand wordmark', async ({ page }) => {
    await page.goto('/about/')

    await primaryNav(page).getByRole('link', { name: /Agents Repo/ }).click()

    await expect(page.getByRole('heading', { name: homeHeading, level: 1 })).toBeVisible()
  })

  const directLinks = [
    { name: 'Packages', heading: 'All packages' },
    { name: 'Docs', heading: 'Docs' },
    { name: 'Help Us', heading: 'Help Us' },
  ] as const

  for (const { name, heading } of directLinks) {
    test(`opens ${name} from a direct header link`, async ({ page }) => {
      await page.goto('/')

      await primaryNav(page).getByRole('link', { name }).click()

      await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible()
    })
  }

  const aboutItems = [
    { name: 'About', heading: 'About' },
    { name: 'Community', heading: 'Community' },
    { name: 'Contact', heading: 'Contact' },
  ] as const

  for (const { name, heading } of aboutItems) {
    test(`opens ${name} from the About dropdown`, async ({ page }) => {
      await page.goto('/')
      const nav = primaryNav(page)

      await nav.getByRole('button', { name: 'About' }).click()
      await nav.getByRole('link', { name }).click()

      await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible()
      await expect(nav.getByRole('button', { name: 'About' })).toHaveAttribute('aria-expanded', 'false')
    })
  }
})
