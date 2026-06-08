const REGISTRY_BASE_URL_OVERRIDE_STORAGE_KEY = 'registry.source.baseUrlOverride'
const REGISTRY_GITHUB_REPOSITORY_URL_OVERRIDE_STORAGE_KEY = 'registry.source.githubRepositoryUrlOverride'

const GITHUB_HOSTNAME = 'github.com'
const GITHUB_WWW_HOSTNAME = 'www.github.com'

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

const isGitHubHostname = (hostname: string): boolean => {
  return hostname === GITHUB_HOSTNAME || hostname === GITHUB_WWW_HOSTNAME
}

export const normalizeRegistryGitHubRepositoryUrlOverrideInput = (value: string): string => {
  return value.trim()
}

export const validateRegistryGitHubRepositoryUrlOverrideInput = (value: string): string | null => {
  const normalized = normalizeRegistryGitHubRepositoryUrlOverrideInput(value)

  if (normalized.length === 0) {
    return null
  }

  if (!canUseHttpUrl(normalized)) {
    return 'Enter a valid GitHub repository URL (https://github.com/owner/repo).'
  }

  try {
    const parsed = new URL(normalized)

    if (!isGitHubHostname(parsed.hostname)) {
      return 'Enter a valid GitHub repository URL (https://github.com/owner/repo).'
    }
  } catch {
    return 'Enter a valid GitHub repository URL (https://github.com/owner/repo).'
  }

  return null
}

export const getStoredRegistryGitHubRepositoryUrlOverride = (): string | null => {
  const storage = getLocalStorage()

  if (!storage) {
    return null
  }

  try {
    const value = storage.getItem(REGISTRY_GITHUB_REPOSITORY_URL_OVERRIDE_STORAGE_KEY)

    if (!value) {
      return null
    }

    const normalized = normalizeRegistryGitHubRepositoryUrlOverrideInput(value)

    if (normalized.length === 0 || validateRegistryGitHubRepositoryUrlOverrideInput(normalized) !== null) {
      return null
    }

    return normalized
  } catch {
    return null
  }
}

export const setStoredRegistryGitHubRepositoryUrlOverride = (value: string): void => {
  const storage = getLocalStorage()

  if (!storage) {
    return
  }

  try {
    storage.setItem(
      REGISTRY_GITHUB_REPOSITORY_URL_OVERRIDE_STORAGE_KEY,
      normalizeRegistryGitHubRepositoryUrlOverrideInput(value),
    )
  } catch {
    // Ignore storage failures; persistence is best-effort.
  }
}

export const clearStoredRegistryGitHubRepositoryUrlOverride = (): void => {
  const storage = getLocalStorage()

  if (!storage) {
    return
  }

  try {
    storage.removeItem(REGISTRY_GITHUB_REPOSITORY_URL_OVERRIDE_STORAGE_KEY)
  } catch {
    // Ignore storage failures; persistence is best-effort.
  }
}
