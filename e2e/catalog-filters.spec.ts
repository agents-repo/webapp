import { test, expect } from './fixtures/registry-mock'
import { waitForCatalogSettled } from './fixtures/catalog-load'

test.describe('Catalog filters', () => {
  test('filters /packages by category and restores the URL after reload', async ({ page }) => {
    await page.goto('/packages')
    await waitForCatalogSettled(page)

    await page.locator('label[for="sidebar-category-agent"]').click()
    await expect(page).toHaveURL(/category=agent/)
    await expect(page.getByRole('heading', { name: 'sample-agent' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'demo-flow' })).toHaveCount(0)

    await page.reload()
    await waitForCatalogSettled(page)
    await expect(page).toHaveURL(/category=agent/)
    await expect(page.getByRole('heading', { name: 'sample-agent' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'demo-flow' })).toHaveCount(0)
  })

  test('updates store-style category counts when a tag is selected', async ({ page }) => {
    await page.goto('/packages')
    await waitForCatalogSettled(page)

    await expect(page.locator('#sidebar-category-tool')).toBeVisible()
    await expect(page.locator('label[for="sidebar-category-tool"]')).toContainText('tool (1)')

    await page.getByRole('button', { name: '#shared (2)', exact: true }).click()
    await expect(page).toHaveURL(/tag=shared/)
    await expect(page.locator('label[for="sidebar-category-agent"]')).toContainText('agent (1)')
    await expect(page.locator('label[for="sidebar-category-flow"]')).toContainText('flow (1)')
    await expect(page.locator('label[for="sidebar-category-tool"]')).toContainText('tool (0)')
  })

  test('keeps the desktop sidebar collapsed after reload', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/packages')
    await waitForCatalogSettled(page)

    await page.getByRole('button', { name: 'Hide filters' }).click()
    await expect(page.getByRole('button', { name: 'Show filters' })).toBeVisible()

    await page.reload()
    await waitForCatalogSettled(page)
    await expect(page.getByRole('button', { name: 'Show filters' })).toBeVisible()
  })

  test('opens the mobile filters offcanvas', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    await page.goto('/packages')
    await waitForCatalogSettled(page)

    await page.getByRole('button', { name: 'Filters' }).click()
    await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible()
    await expect(page.locator('#offcanvas-category-agent')).toBeVisible()
  })

  test('keeps the download period when a filter chip is selected', async ({ page }) => {
    await page.goto('/packages?period=7d')
    await waitForCatalogSettled(page)

    await expect(page.getByLabel('Sort packages by download window')).toHaveValue('7d')
    await expect(page.getByRole('option', { name: 'Downloads (All time)' })).toBeAttached()
    await expect(page.getByRole('option', { name: 'Downloads (Last 7 days)' })).toBeAttached()
    await expect(page.getByRole('option', { name: 'Downloads (Last 30 days)' })).toBeAttached()
    await expect(page.getByRole('option', { name: 'Downloads (Last 365 days)' })).toBeAttached()

    await page.locator('label[for="sidebar-category-agent"]').click()
    await expect(page).toHaveURL(/period=7d/)
    await expect(page).toHaveURL(/category=agent/)
  })
})
