import { test, expect } from './fixtures/registry-mock'

test.describe('Docs navigation', () => {
  test('shows the article before opening the mobile docs offcanvas', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    await page.goto('/docs/getting-started')

    await expect(page.getByRole('heading', { name: 'Getting started', level: 1 })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Browse docs' })).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Docs' })).toHaveCount(0)
  })

  test('opens the mobile docs offcanvas and closes after choosing a topic', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    await page.goto('/docs')

    await page.getByRole('button', { name: 'Browse docs' }).click()
    const dialog = page.getByRole('dialog', { name: 'Docs' })
    await expect(dialog).toBeVisible()

    await dialog.getByRole('link', { name: 'Getting started' }).click()
    await expect(page).toHaveURL(/\/docs\/getting-started\/?$/)
    await expect(page.getByRole('heading', { name: 'Getting started', level: 1 })).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Docs' })).toHaveCount(0)
  })

  test('keeps the desktop sidebar without the Browse docs button', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/docs')

    await expect(page.getByRole('navigation', { name: 'Docs' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Browse docs' })).toHaveCount(0)
  })
})
