import type { RegistryCatalog } from '../domain/package'
import { isRegistryCatalog } from './registryCatalogValidation'
import { readFreshCatalogCache, readStaleCatalogCache, writeCatalogCache } from './registryCatalogCache'
import { getRegistrySourceConfig } from './registrySourceConfig'

export interface RegistryCatalogLoadResult {
  catalog: RegistryCatalog | null
  indexUrl: string
  cacheState: 'none' | 'fresh' | 'stale-fallback'
  errorMessage?: string
}

export const loadRegistryCatalog = async (
  options: { signal?: AbortSignal } = {},
): Promise<RegistryCatalogLoadResult> => {
  const { indexUrl } = getRegistrySourceConfig()
  const cachedCatalog = readFreshCatalogCache(indexUrl)

  if (cachedCatalog) {
    return {
      catalog: cachedCatalog,
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
      indexUrl,
      cacheState: 'none',
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown registry loading error'
    const staleCatalog = readStaleCatalogCache(indexUrl)

    if (staleCatalog) {
      return {
        catalog: staleCatalog,
        indexUrl,
        cacheState: 'stale-fallback',
        errorMessage,
      }
    }

    return {
      catalog: null,
      indexUrl,
      cacheState: 'none',
      errorMessage,
    }
  }
}
