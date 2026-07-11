import { expect, type Page } from '@playwright/test'

const catalogLoadingSummary = 'Loading registry catalog'

export async function waitForCatalogSettled(page: Page): Promise<void> {
  const catalogSummary = page.locator('p[aria-live="polite"]').first()

  await expect(catalogSummary).toBeVisible()
  await expect(catalogSummary).not.toHaveText(catalogLoadingSummary)
}
