import { test, expect } from './fixtures/registry-mock'
import { waitForCatalogSettled } from './fixtures/catalog-load'

test.describe('Home search', () => {
  test('filters packages by query', async ({ page }) => {
    await page.goto('/')
    await waitForCatalogSettled(page)

    const searchInput = page.getByRole('textbox', { name: 'Search registry packages' })
    await expect(searchInput).toBeVisible()

    await searchInput.fill('demo-flow')
    await expect(page.getByRole('heading', { name: 'demo-flow', level: 3 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'sample-agent', level: 3 })).not.toBeVisible()

    await searchInput.fill('no-such-package')
    await expect(page.getByText('No packages match your current search.')).toBeVisible()
  })
})
