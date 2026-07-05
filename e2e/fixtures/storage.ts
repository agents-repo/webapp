import type { Page } from '@playwright/test'

const storageClearedMarker = '__e2e_storage_cleared__'

/**
 * Clears storage on the first navigation only. Later navigations (including
 * `page.reload()`) skip clearing so persistence specs can assert saved state.
 */
const analyticsConsentStorageKey = 'analytics-consent'

export async function clearBrowserStorage(page: Page): Promise<void> {
  await page.addInitScript(
    ({ marker, consentKey }: { marker: string; consentKey: string }) => {
      if (sessionStorage.getItem(marker)) {
        return
      }

      localStorage.clear()
      sessionStorage.clear()
      localStorage.setItem(consentKey, 'rejected')
      sessionStorage.setItem(marker, '1')
    },
    { marker: storageClearedMarker, consentKey: analyticsConsentStorageKey },
  )
}
