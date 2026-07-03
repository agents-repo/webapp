import type { Page } from '@playwright/test'

export async function clearBrowserStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}
