import { test, expect } from './fixtures/registry-mock'
import { waitForCatalogSettled } from './fixtures/catalog-load'

test.describe('Home search', () => {
  test('navigates to packages search for a non-empty query', async ({ page }) => {
    await page.goto('/')
    await waitForCatalogSettled(page)

    const searchInput = page.getByRole('textbox', { name: 'Search registry packages' })
    await expect(searchInput).toBeVisible()

    await searchInput.fill('demo-flow')
    await expect(page).toHaveURL(/\/packages\/?\?q=demo-flow/)
    await waitForCatalogSettled(page)
    await expect(page.getByRole('heading', { name: 'demo-flow', level: 3 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'sample-agent', level: 3 })).toHaveCount(0)
  })

  test('stays on home when search is empty', async ({ page }) => {
    await page.goto('/')
    await waitForCatalogSettled(page)

    const searchInput = page.getByRole('textbox', { name: 'Search registry packages' })
    await expect(searchInput).toBeVisible()
    await searchInput.press('Enter')
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: /Most downloaded in the last year/ })).toBeVisible()
  })
})
