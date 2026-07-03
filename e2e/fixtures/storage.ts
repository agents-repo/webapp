import type { Page } from '@playwright/test'

const storageClearedMarker = '__e2e_storage_cleared__'

/**
 * Clears storage on the first navigation only. Later navigations (including
 * `page.reload()`) skip clearing so persistence specs can assert saved state.
 */
export async function clearBrowserStorage(page: Page): Promise<void> {
  await page.addInitScript((marker) => {
    if (sessionStorage.getItem(marker)) {
      return
    }

    localStorage.clear()
    sessionStorage.clear()
    sessionStorage.setItem(marker, '1')
  }, storageClearedMarker)
}
