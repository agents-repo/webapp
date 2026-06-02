const REGISTRY_BASE_URL_OVERRIDE_STORAGE_KEY = 'registry.source.baseUrlOverride'

const getLocalStorage = (): Storage | null => {
  try {
    return globalThis.localStorage
  } catch {
    return null
  }
}

const canUseHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const normalizeRegistryBaseUrlOverrideInput = (value: string): string => {
  return value.trim()
}

export const validateRegistryBaseUrlOverrideInput = (value: string): string | null => {
  const normalized = normalizeRegistryBaseUrlOverrideInput(value)

  if (normalized.length === 0) {
    return null
  }

  if (!canUseHttpUrl(normalized)) {
    return 'Enter a valid HTTP or HTTPS URL.'
  }

  return null
}

export const getStoredRegistryBaseUrlOverride = (): string | null => {
  const storage = getLocalStorage()

  if (!storage) {
    return null
  }

  try {
    const value = storage.getItem(REGISTRY_BASE_URL_OVERRIDE_STORAGE_KEY)

    if (!value) {
      return null
    }

    const normalized = normalizeRegistryBaseUrlOverrideInput(value)

    if (normalized.length === 0 || !canUseHttpUrl(normalized)) {
      return null
    }

    return normalized
  } catch {
    return null
  }
}

export const setStoredRegistryBaseUrlOverride = (value: string): void => {
  const storage = getLocalStorage()

  if (!storage) {
    return
  }

  try {
    storage.setItem(REGISTRY_BASE_URL_OVERRIDE_STORAGE_KEY, normalizeRegistryBaseUrlOverrideInput(value))
  } catch {
    // Ignore storage failures; persistence is best-effort.
  }
}

export const clearStoredRegistryBaseUrlOverride = (): void => {
  const storage = getLocalStorage()

  if (!storage) {
    return
  }

  try {
    storage.removeItem(REGISTRY_BASE_URL_OVERRIDE_STORAGE_KEY)
  } catch {
    // Ignore storage failures; persistence is best-effort.
  }
}
