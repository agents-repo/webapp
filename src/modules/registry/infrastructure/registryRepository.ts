import type { RegistryCatalog, RegistryPackage } from '../domain/package'
import { getMockRegistryCatalog } from './mockRegistryRepository'
import { readFreshCatalogCache, readStaleCatalogCache, writeCatalogCache } from './registryCatalogCache'
import { getRegistrySourceConfig } from './registrySourceConfig'

export interface RegistryCatalogLoadResult {
  catalog: RegistryCatalog
  source: 'remote' | 'mock'
  indexUrl: string
  cacheState?: 'none' | 'fresh' | 'stale-fallback'
  errorMessage?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

const isEstimateOverallCost = (
  value: unknown,
): value is RegistryPackage['estimateOverallCost'] => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.estimatedCost === 'number' &&
    (value.band === 'low' || value.band === 'moderate' || value.band === 'high')
  )
}

const hasRegistryPackageStrings = (value: Record<string, unknown>): boolean => {
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    typeof value.owner === 'string' &&
    typeof value.latest === 'string' &&
    typeof value.category === 'string'
  )
}

const isRegistryPackage = (value: unknown): value is RegistryPackage => {
  if (!isRecord(value)) {
    return false
  }

  if (!hasRegistryPackageStrings(value)) {
    return false
  }

  if (!isStringArray(value.tags)) {
    return false
  }

  if (value.status !== 'active' && value.status !== 'inactive') {
    return false
  }

  if (!isEstimateOverallCost(value.estimateOverallCost)) {
    return false
  }

  return value.quickstart === undefined || typeof value.quickstart === 'string'
}

const isRegistryCatalog = (value: unknown): value is RegistryCatalog => {
  if (!isRecord(value)) {
    return false
  }

  if (typeof value.schemaVersion !== 'string' || typeof value.updatedAt !== 'string') {
    return false
  }

  return Array.isArray(value.packages) && value.packages.every((pkg) => isRegistryPackage(pkg))
}

export const loadRegistryCatalog = async (
  options: { signal?: AbortSignal } = {},
): Promise<RegistryCatalogLoadResult> => {
  const { indexUrl } = getRegistrySourceConfig()
  const cachedCatalog = readFreshCatalogCache(indexUrl)

  if (cachedCatalog) {
    return {
      catalog: cachedCatalog,
      source: 'remote',
      indexUrl,
      cacheState: 'fresh',
    }
  }

  try {
    const response = await fetch(indexUrl, {
      signal: options.signal,
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Registry request failed (${response.status} ${response.statusText})`)
    }

    const payload: unknown = await response.json()

    if (!isRegistryCatalog(payload)) {
      throw new Error('Registry payload does not match expected catalog schema')
    }

    writeCatalogCache(indexUrl, payload)

    return {
      catalog: payload,
      source: 'remote',
      indexUrl,
      cacheState: 'none',
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown registry loading error'
    const staleCatalog = readStaleCatalogCache(indexUrl)

    if (staleCatalog) {
      return {
        catalog: staleCatalog,
        source: 'remote',
        indexUrl,
        cacheState: 'stale-fallback',
        errorMessage,
      }
    }

    return {
      catalog: getMockRegistryCatalog(),
      source: 'mock',
      indexUrl,
      cacheState: 'none',
      errorMessage,
    }
  }
}
