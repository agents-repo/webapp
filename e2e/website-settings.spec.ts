import { test, expect, mockRegistryIndex, mockRegistryStats } from './fixtures/registry-mock'
import {
  alternateOverrideCatalog,
  E2E_OVERRIDE_INDEX_URL,
  E2E_OVERRIDE_REGISTRY_BASE_URL,
} from './fixtures/catalog'
import { clearBrowserStorage } from './fixtures/storage'
import { waitForCatalogSettled } from './fixtures/catalog-load'

test.describe('Website settings', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserStorage(page)
  })

  test('shows validation error for invalid registry URL', async ({ page }) => {
    await page.goto('/')
    await waitForCatalogSettled(page)
    await page.getByRole('button', { name: 'Open website settings' }).click()

    await expect(page.getByText('schema v1.3.0')).toBeVisible()

    await page.getByLabel('Registry base URL override').fill('not-a-valid-url')
    await page.getByRole('button', { name: 'Save changes' }).click()

    await expect(page.getByText('Enter a valid HTTP or HTTPS URL.')).toBeVisible()
  })

  test('reloads catalog after saving a valid override', async ({ page }) => {
    await mockRegistryIndex(page, alternateOverrideCatalog, E2E_OVERRIDE_INDEX_URL)
    await mockRegistryStats(page, { packages: [] }, `${E2E_OVERRIDE_REGISTRY_BASE_URL}/stats`)

    await page.goto('/')
    await waitForCatalogSettled(page)
    await expect(page.getByRole('heading', { name: 'sample-agent', level: 3 })).toBeVisible()

    await page.getByRole('button', { name: 'Open website settings' }).click()
    await page.getByLabel('Registry base URL override').fill('https://override.e2e.local/registry')
    await page.getByRole('button', { name: 'Save changes' }).click()

    await waitForCatalogSettled(page)
    await expect(page.getByRole('heading', { name: 'override-agent', level: 3 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'sample-agent', level: 3 })).not.toBeVisible()
  })
})
