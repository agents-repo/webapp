import { test, expect, mockRegistryIndex } from './fixtures/registry-mock'
import { paginatedCatalog } from './fixtures/catalog'
import { waitForCatalogSettled } from './fixtures/catalog-load'

test.describe('Catalog pagination', () => {
  test('pages the packages index and drops page after a filter', async ({ page }) => {
    await mockRegistryIndex(page, paginatedCatalog)
    await page.goto('/packages')
    await waitForCatalogSettled(page)

    await expect(page.getByRole('heading', { name: 'page-agent-01' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'page-agent-13' })).toHaveCount(0)
    await expect(page.getByText('Showing 1–9 of 13 packages')).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Package results pages' })).toBeVisible()

    await page.getByRole('navigation', { name: 'Package results pages' }).getByRole('link', { name: '2', exact: true }).click()
    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByRole('heading', { name: 'page-agent-13' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'page-agent-01' })).toHaveCount(0)

    await page.reload()
    await waitForCatalogSettled(page)
    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByRole('heading', { name: 'page-agent-13' })).toBeVisible()

    await page.locator('label[for="sidebar-category-flow"]').click()
    await expect(page).toHaveURL(/category=flow/)
    await expect(page).not.toHaveURL(/page=/)
    await expect(page.getByRole('navigation', { name: 'Package results pages' })).toHaveCount(0)
    await expect(page.getByText('Showing 1 of 13 packages')).toBeVisible()
  })
})
