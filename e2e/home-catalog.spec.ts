import { test, expect } from './fixtures/registry-mock'
import { waitForCatalogSettled, expectCatalogLoadingWhenObservable } from './fixtures/catalog-load'

test.describe('Home catalog', () => {
  test('loads mocked registry packages', async ({ page }) => {
    await page.goto('/')

    await expectCatalogLoadingWhenObservable(page)

    await waitForCatalogSettled(page)

    await expect(
      page.getByRole('heading', { name: 'Ready-to-use agents and flows for Copilot, Cursor, Claude Code, and Codex' }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Install with the CLI' })).toBeVisible()
    await expect(page.getByTestId('home-cli-init-terminal')).toContainText(
      'npx agents-repo init --targets cursor github-copilot',
    )
    await expect(page.getByTestId('home-cli-install-terminal')).toContainText(
      'npx agents-repo install agents-repo/some-package',
    )
    await expect(page.getByRole('heading', { name: 'Most downloaded in the last year' })).toBeVisible()
    const viewAllPackagesLinks = page.getByRole('link', { name: 'View all packages' })
    await expect(viewAllPackagesLinks).toHaveCount(2)
    await expect(viewAllPackagesLinks.first()).toHaveAttribute('href', '/packages/')
    await expect(viewAllPackagesLinks.nth(1)).toHaveAttribute('href', '/packages/')
    await expect(page.getByText(/schema v/)).toHaveCount(0)
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
