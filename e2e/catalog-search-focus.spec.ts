import { test, expect, mockRegistryIndex } from './fixtures/registry-mock'
import { paginatedCatalog } from './fixtures/catalog'
import { waitForCatalogSettled } from './fixtures/catalog-load'

test.describe('Catalog search focus', () => {
  test('keeps focus while typing after sticky header search activates', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await mockRegistryIndex(page, paginatedCatalog)
    await page.goto('/packages')
    await waitForCatalogSettled(page)

    const searchInput = page.locator('#packages-index-search')
    await searchInput.click()
    await searchInput.fill('page-agent')

    await page.evaluate(() => {
      window.scrollTo(0, 240)
    })

    await expect(searchInput).toBeFocused()
    await expect(searchInput).toHaveValue('page-agent')
  })
})
