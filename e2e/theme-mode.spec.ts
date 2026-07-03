import { test, expect } from '@playwright/test'
import { mockRegistryIndex } from './fixtures/registry-mock'
import { searchableCatalog } from './fixtures/catalog'
import { clearBrowserStorage } from './fixtures/storage'

test.describe('Theme mode', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserStorage(page)
    await mockRegistryIndex(page, searchableCatalog)
  })

  test('persists dark mode across reload', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: /Color mode:/ }).click()
    await page.locator('.theme-mode-dropdown .dropdown-menu').getByRole('button', { name: 'Dark' }).click()

    await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'dark')

    await page.reload()

    await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'dark')
    await expect(page.getByRole('button', { name: 'Color mode: Dark' })).toBeVisible()

    const theme = await page.evaluate(() => localStorage.getItem('theme'))
    expect(theme).toBe('dark')
  })
})
