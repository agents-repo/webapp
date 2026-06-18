import type { RegistryCatalog } from '../domain/package'
import { isRegistryCatalog } from './registryCatalogValidation'
import {
  readFreshCatalogCache,
  readCatalogCacheEnvelope,
  touchCatalogCache,
  writeCatalogCache,
} from './registryCatalogCache'
import {
  getRegistrySourceConfig,
  resolveRegistryBrowseSourceMetadata,
  resolveRegistryFetchSourceConfig,
} from './registrySourceConfig'

export interface RegistryCatalogLoadResult {
  catalog: RegistryCatalog | null
  indexUrl: string
  registryBaseUrl: string
  cacheState: 'none' | 'fresh' | 'stale-fallback'
  errorMessage?: string
  baseUrlRefResolution?: { alias: string; resolvedRef: string } | null
  githubRepositoryUrl?: string
  githubRepositoryRefResolution?: { alias: string; resolvedRef: string } | null
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

const buildCatalogLoadMetadata = (
  fetchSourceConfig: Awaited<ReturnType<typeof resolveRegistryFetchSourceConfig>>,
  browseMetadata: Awaited<ReturnType<typeof resolveRegistryBrowseSourceMetadata>>,
): Pick<
  RegistryCatalogLoadResult,
  'baseUrlRefResolution' | 'githubRepositoryUrl' | 'githubRepositoryRefResolution'
> => ({
  baseUrlRefResolution: fetchSourceConfig.baseUrlRefResolution,
  githubRepositoryUrl: browseMetadata.githubRepositoryUrl,
  githubRepositoryRefResolution: browseMetadata.githubRepositoryRefResolution,
})

const getFallbackBrowseCatalogLoadMetadata = (): Awaited<
  ReturnType<typeof resolveRegistryBrowseSourceMetadata>
> => {
  const configuredSource = getRegistrySourceConfig()

  return {
    githubRepositoryUrl: configuredSource.githubRepositoryUrl,
    githubRepositoryRefResolution: null,
  }
}

const resolveBrowseCatalogLoadMetadata = async (options: {
  signal?: AbortSignal
}): Promise<Awaited<ReturnType<typeof resolveRegistryBrowseSourceMetadata>>> => {
  try {
    return await resolveRegistryBrowseSourceMetadata(options)
  } catch {
    return getFallbackBrowseCatalogLoadMetadata()
  }
}

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
  let fetchSourceConfig

  try {
    fetchSourceConfig = await resolveRegistryFetchSourceConfig({ signal: options.signal })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown registry source resolution error'
    const configuredSource = getRegistrySourceConfig()

    return {
      catalog: null,
      indexUrl: '',
      registryBaseUrl: '',
      cacheState: 'none',
      errorMessage,
      ...buildCatalogLoadMetadata(configuredSource, getFallbackBrowseCatalogLoadMetadata()),
    }
  }

  const { indexUrl, baseUrl: registryBaseUrl } = fetchSourceConfig
  const browseMetadataPromise = resolveBrowseCatalogLoadMetadata({ signal: options.signal })
  const cachedCatalog = readFreshCatalogCache(indexUrl)

  if (cachedCatalog) {
    return {
      catalog: cachedCatalog,
      indexUrl,
      registryBaseUrl,
      cacheState: 'fresh',
      ...buildCatalogLoadMetadata(fetchSourceConfig, await browseMetadataPromise),
    }
  }

  const envelope = readCatalogCacheEnvelope(indexUrl)
  const conditionalHeaders = buildConditionalHeaders(envelope)

  try {
    const [result, browseMetadata] = await Promise.all([
      fetchCatalogFromNetwork(indexUrl, options.signal, conditionalHeaders),
      browseMetadataPromise,
    ])
    const catalogMetadata = buildCatalogLoadMetadata(fetchSourceConfig, browseMetadata)

    if (result.notModified) {
      if (!envelope?.catalog) {
        return {
          catalog: null,
          indexUrl,
          registryBaseUrl,
          cacheState: 'none',
          errorMessage: 'Registry returned 304 Not Modified without cached catalog state',
          ...catalogMetadata,
        }
      }

      touchCatalogCache(indexUrl)

      return {
        catalog: envelope.catalog,
        indexUrl,
        registryBaseUrl,
        cacheState: 'fresh',
        ...catalogMetadata,
      }
    }

    writeCatalogCache(indexUrl, result.catalog, result.etag, result.lastModified)

    return {
      catalog: result.catalog,
      indexUrl,
      registryBaseUrl,
      cacheState: 'none',
      ...catalogMetadata,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown registry loading error'
    const catalogMetadata = buildCatalogLoadMetadata(fetchSourceConfig, await browseMetadataPromise)

    if (envelope?.catalog) {
      return {
        catalog: envelope.catalog,
        indexUrl,
        registryBaseUrl,
        cacheState: 'stale-fallback',
        errorMessage,
        ...catalogMetadata,
      }
    }

    return {
      catalog: null,
      indexUrl,
      registryBaseUrl,
      cacheState: 'none',
      errorMessage,
      ...catalogMetadata,
    }
  }
}
