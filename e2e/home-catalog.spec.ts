import { test, expect } from './fixtures/registry-mock'
import { waitForCatalogSettled, expectCatalogLoadingWhenObservable } from './fixtures/catalog-load'

test.describe('Home catalog', () => {
  test('loads mocked registry packages', async ({ page }) => {
    await page.goto('/')

    await expectCatalogLoadingWhenObservable(page)

    await waitForCatalogSettled(page)

    await expect(
      page.getByRole('heading', { name: 'Explore ready-to-use agents and flows' }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'sample-agent' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Download sample-agent' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'CLI install for sample-agent' })).toBeVisible()
  })

  test('keeps the CLI install popover inside the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 640 })
    await page.goto('/')
    await waitForCatalogSettled(page)

    const cliButton = page.getByRole('button', { name: 'CLI install for sample-agent' })
    await cliButton.evaluate((element) => {
      const topInset = 80
      window.scrollBy(0, element.getBoundingClientRect().top - topInset)
    })
    await cliButton.click()

    const popover = page.locator('#cli-install-popover-agents-repo--sample-agent')
    await expect(popover).toBeVisible()
    await expect(page.getByText('Choose AI tool')).toBeVisible()
    await expect(popover).toBeInViewport({ ratio: 1 })
  })
})
