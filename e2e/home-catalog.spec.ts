import { test, expect } from './fixtures/registry-mock'
import { waitForCatalogSettled } from './fixtures/catalog-load'

test.describe('Home catalog', () => {
  test('loads mocked registry packages', async ({ page }) => {
    await page.goto('/')
    await waitForCatalogSettled(page)

    await expect(
      page.getByRole('heading', { name: 'Explore ready-to-use agents and flows' }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'sample-agent' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Download sample-agent' })).toBeVisible()
  })
})
