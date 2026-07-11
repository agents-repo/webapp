import { expect, type Page } from '@playwright/test'

const catalogLoadingSummary = 'Loading registry catalog'

export async function waitForCatalogSettled(page: Page): Promise<void> {
  await expect(page.getByText(catalogLoadingSummary)).toHaveCount(0)
}
