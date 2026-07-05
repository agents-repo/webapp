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

  const storedValue = storage.getItem(analyticsConsentStorageKey)
  return isAnalyticsConsent(storedValue) ? storedValue : null
}

export function persistAnalyticsConsent(value: AnalyticsConsent): void {
  const storage = getLocalStorage()
  if (!storage) {
    return
  }

  storage.setItem(analyticsConsentStorageKey, value)
}

export function clearAnalyticsConsent(): void {
  const storage = getLocalStorage()
  if (!storage) {
    return
  }

  storage.removeItem(analyticsConsentStorageKey)
}

export function hasAnalyticsConsentDecision(): boolean {
  return getStoredAnalyticsConsent() !== null
}

export const analyticsConsentStorageKeyForDocs = analyticsConsentStorageKey
