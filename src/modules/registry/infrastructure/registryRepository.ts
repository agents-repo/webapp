import type { RegistryCatalog } from '../domain/package'
import { isRegistryCatalog } from './registryCatalogValidation'
import {
  readFreshCatalogCache,
  readCatalogCacheEnvelope,
  touchCatalogCache,
  writeCatalogCache,
} from './registryCatalogCache'
import { getRegistrySourceConfig } from './registrySourceConfig'

export interface RegistryCatalogLoadResult {
  catalog: RegistryCatalog | null
  indexUrl: string
  registryBaseUrl: string
  cacheState: 'none' | 'fresh' | 'stale-fallback'
  errorMessage?: string
}

interface FetchCatalogResult {
  notModified: true
  catalog?: never
  etag?: never
  lastModified?: never
}

interface FetchCatalogSuccess {
  notModified?: false
  catalog: RegistryCatalog
  etag: string | undefined
  lastModified: string | undefined
}

type FetchCatalogNetworkResult = FetchCatalogResult | FetchCatalogSuccess

const buildConditionalHeaders = (
  envelope: ReturnType<typeof readCatalogCacheEnvelope>,
): Record<string, string> => {
  const headers: Record<string, string> = {}

  if (envelope?.etag) {
    headers['If-None-Match'] = envelope.etag
  }

  if (envelope?.lastModified) {
    headers['If-Modified-Since'] = envelope.lastModified
  }

  return headers
}

const fetchCatalogFromNetwork = async (
  indexUrl: string,
  signal: AbortSignal | undefined,
  conditionalHeaders: Record<string, string>,
): Promise<FetchCatalogNetworkResult> => {
  const response = await fetch(indexUrl, {
    signal,
    cache: 'no-store',
    headers: { Accept: 'application/json', ...conditionalHeaders },
  })

  if (response.status === 304) {
    return { notModified: true }
  }

  if (!response.ok) {
    throw new Error(`Registry request failed (${response.status} ${response.statusText})`)
  }

  const payload: unknown = await response.json()

  if (!isRegistryCatalog(payload)) {
    throw new Error('Registry payload does not match expected catalog schema')
  }

  return {
    catalog: payload,
    etag: response.headers.get('ETag') ?? undefined,
    lastModified: response.headers.get('Last-Modified') ?? undefined,
  }
}

export const loadRegistryCatalog = async (
  options: { signal?: AbortSignal } = {},
): Promise<RegistryCatalogLoadResult> => {
  const { indexUrl, baseUrl: registryBaseUrl } = getRegistrySourceConfig()
  const cachedCatalog = readFreshCatalogCache(indexUrl)

  if (cachedCatalog) {
    return { catalog: cachedCatalog, indexUrl, registryBaseUrl, cacheState: 'fresh' }
  }

  const envelope = readCatalogCacheEnvelope(indexUrl)
  const conditionalHeaders = buildConditionalHeaders(envelope)

  try {
    const result = await fetchCatalogFromNetwork(indexUrl, options.signal, conditionalHeaders)

    if (result.notModified) {
      if (!envelope?.catalog) {
        return {
          catalog: null,
          indexUrl,
          registryBaseUrl,
          cacheState: 'none',
          errorMessage: 'Registry returned 304 Not Modified without cached catalog state',
        }
      }

      touchCatalogCache(indexUrl)

      return { catalog: envelope.catalog, indexUrl, registryBaseUrl, cacheState: 'fresh' }
    }

    writeCatalogCache(indexUrl, result.catalog, result.etag, result.lastModified)

    return { catalog: result.catalog, indexUrl, registryBaseUrl, cacheState: 'none' }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown registry loading error'

    if (envelope?.catalog) {
      return { catalog: envelope.catalog, indexUrl, registryBaseUrl, cacheState: 'stale-fallback', errorMessage }
    }

    return { catalog: null, indexUrl, registryBaseUrl, cacheState: 'none', errorMessage }
  }
}
