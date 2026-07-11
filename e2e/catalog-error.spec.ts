import { test, expect } from '@playwright/test'
import { mockRegistryIndexFailure } from './fixtures/registry-mock'
import { clearBrowserStorage } from './fixtures/storage'
import { waitForCatalogSettled } from './fixtures/catalog-load'

test.describe('Catalog error', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserStorage(page)
    await mockRegistryIndexFailure(page)
  })

  test('shows error when index fetch fails with no cache', async ({ page }) => {
    await page.goto('/')
    await waitForCatalogSettled(page)

    await expect(
      page.getByText('Unable to load the registry index. No catalog data is available.'),
    ).toBeVisible()
  })
})
