export type AnalyticsConsent = 'accepted' | 'rejected'

const analyticsConsentStorageKey = 'analytics-consent'

function getLocalStorage(): Storage | null {
  try {
    return globalThis.localStorage
  } catch {
    return null
  }
}

function isAnalyticsConsent(value: string | null): value is AnalyticsConsent {
  return value === 'accepted' || value === 'rejected'
}

export function getStoredAnalyticsConsent(): AnalyticsConsent | null {
  const storage = getLocalStorage()
  if (!storage) {
    return null
  }

  try {
    const storedValue = storage.getItem(analyticsConsentStorageKey)
    return isAnalyticsConsent(storedValue) ? storedValue : null
  } catch {
    return null
  }
}

export function persistAnalyticsConsent(value: AnalyticsConsent): void {
  const storage = getLocalStorage()
  if (!storage) {
    return
  }

  try {
    storage.setItem(analyticsConsentStorageKey, value)
  } catch {
    // Ignore storage failures; persistence is best-effort.
  }
}

export function clearAnalyticsConsent(): void {
  const storage = getLocalStorage()
  if (!storage) {
    return
  }

  try {
    storage.removeItem(analyticsConsentStorageKey)
  } catch {
    // Ignore storage failures; persistence is best-effort.
  }
}

export function hasAnalyticsConsentDecision(): boolean {
  return getStoredAnalyticsConsent() !== null
}

export const analyticsConsentStorageKeyForDocs = analyticsConsentStorageKey
