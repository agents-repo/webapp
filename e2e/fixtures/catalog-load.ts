import { expect, type Page } from '@playwright/test'

const catalogLoadingSummary = 'Loading registry catalog'

export async function waitForCatalogSettled(page: Page): Promise<void> {
  const catalogSummary = page.locator('p[aria-live="polite"]').first()

  await expect(catalogSummary).toBeVisible()
  await expect(catalogSummary).not.toHaveText(catalogLoadingSummary)
}

export async function expectCatalogLoadingWhenObservable(page: Page): Promise<void> {
  const loadingSummary = page.getByText(catalogLoadingSummary)
  const sawLoading = await loadingSummary
    .waitFor({ state: 'visible', timeout: 2_000 })
    .then(() => true)
    .catch(() => false)

  if (sawLoading) {
    await expect(
      page.locator('[aria-labelledby="catalog-results-summary"][aria-busy="true"]'),
    ).toBeVisible()
  }
}
