import semver from 'semver'

import type { RegistryCatalog } from '../domain/package'
import { isRegistryCatalog } from './registryCatalogValidation'
import {
  readFreshCatalogCache,
  readCatalogCacheEnvelope,
  readFreshCatalogCacheEnvelopeForSourceIdentity,
  readStaleCatalogCacheEnvelopeForSourceIdentity,
  touchCatalogCache,
  writeCatalogCache,
  type RegistryCatalogCacheEnvelope,
} from './registryCatalogCache'
import {
  extractMajorVersionLineAliasFromSourceUrl,
  extractRegistryRef,
  inferRegistryRepositoryIdentity,
  parseGitHubRepositoryIdentity,
  substituteRegistryRef,
} from './registryMajorVersionRef'
import {
  getRegistrySourceConfig,
  resolveRegistryBrowseSourceMetadata,
  resolveRegistryFetchSourceConfig,
} from './registrySourceConfig'
import {
  getRegistryBaseUrlFromIndexUrl,
  getRegistrySourceCacheIdentity,
  type RegistrySourceCacheIdentity,
} from './registrySourceUrl'

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

export interface LoadRegistryCatalogOptions {
  readonly signal?: AbortSignal
  readonly bypassTagCache?: boolean
  readonly forceSourceResolution?: boolean
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

type BrowseCatalogLoadMetadata = Awaited<ReturnType<typeof resolveRegistryBrowseSourceMetadata>>

type ResolveSourceOptions = {
  readonly signal?: AbortSignal
  readonly bypassTagCache?: boolean
}

const buildCatalogLoadMetadata = (
  fetchSourceConfig: Awaited<ReturnType<typeof resolveRegistryFetchSourceConfig>>,
  browseMetadata: BrowseCatalogLoadMetadata,
): Pick<
  RegistryCatalogLoadResult,
  'baseUrlRefResolution' | 'githubRepositoryUrl' | 'githubRepositoryRefResolution'
> => ({
  baseUrlRefResolution: fetchSourceConfig.baseUrlRefResolution,
  githubRepositoryUrl: browseMetadata.githubRepositoryUrl,
  githubRepositoryRefResolution: browseMetadata.githubRepositoryRefResolution,
})

const getFallbackBrowseCatalogLoadMetadata = (): BrowseCatalogLoadMetadata => {
  const configuredSource = getRegistrySourceConfig()

  return {
    githubRepositoryUrl: configuredSource.githubRepositoryUrl,
    githubRepositoryRefResolution: null,
  }
}

const getConfiguredSourceCacheIdentity = (): RegistrySourceCacheIdentity | null => {
  const configuredSource = getRegistrySourceConfig()
  const baseUrlInput = configuredSource.runtimeBaseUrlOverride ?? configuredSource.configuredBaseUrl
  const identity = getRegistrySourceCacheIdentity(baseUrlInput, configuredSource.indexPath)

  if (!identity) {
    return null
  }

  return {
    ...identity,
    sourceRef: extractRegistryRef(baseUrlInput),
  }
}

const inferBaseUrlRefResolutionFromCachedIndexUrl = (
  configuredSource: ReturnType<typeof getRegistrySourceConfig>,
  cachedIndexUrl: string,
): { alias: string; resolvedRef: string } | null => {
  const baseUrlInput =
    configuredSource.runtimeBaseUrlOverride ?? configuredSource.configuredBaseUrl
  const alias = extractMajorVersionLineAliasFromSourceUrl(baseUrlInput)

  if (!alias) {
    return null
  }

  const registryBaseUrl = getRegistryBaseUrlFromIndexUrl(cachedIndexUrl, configuredSource.indexPath)
  const resolvedRef = extractRegistryRef(registryBaseUrl)

  if (!resolvedRef) {
    return null
  }

  return {
    alias: alias.alias,
    resolvedRef,
  }
}

const getMajorVersionFromConcreteRef = (ref: string): number | null => {
  const version = semver.valid(semver.coerce(ref, { loose: true }))

  if (!version) {
    return null
  }

  return semver.major(version)
}

const repositoryIdentitiesMatch = (
  left: ReturnType<typeof parseGitHubRepositoryIdentity>,
  right: ReturnType<typeof parseGitHubRepositoryIdentity>,
): boolean => {
  return left !== null && right !== null && left.owner === right.owner && left.repo === right.repo
}

const inferBrowseMetadataFromCachedRef = (
  configuredSource: ReturnType<typeof getRegistrySourceConfig>,
  cachedIndexUrl: string,
): BrowseCatalogLoadMetadata | null => {
  const githubRepositoryUrl = configuredSource.githubRepositoryUrl
  const browseAlias = extractMajorVersionLineAliasFromSourceUrl(githubRepositoryUrl)

  if (!browseAlias) {
    return {
      githubRepositoryUrl,
      githubRepositoryRefResolution: null,
    }
  }

  const baseUrlRefResolution = inferBaseUrlRefResolutionFromCachedIndexUrl(configuredSource, cachedIndexUrl)

  if (!baseUrlRefResolution) {
    return null
  }

  const browseRepositoryIdentity = parseGitHubRepositoryIdentity(githubRepositoryUrl)
  const catalogSourceUrl =
    configuredSource.runtimeBaseUrlOverride ?? configuredSource.configuredBaseUrl
  const catalogRepositoryIdentity = inferRegistryRepositoryIdentity(
    catalogSourceUrl,
    configuredSource.configuredGithubRepositoryUrl,
  )

  if (!repositoryIdentitiesMatch(browseRepositoryIdentity, catalogRepositoryIdentity)) {
    return null
  }

  const resolvedMajor = getMajorVersionFromConcreteRef(baseUrlRefResolution.resolvedRef)

  if (resolvedMajor === null || resolvedMajor !== browseAlias.major) {
    return null
  }

  return {
    githubRepositoryUrl: substituteRegistryRef(githubRepositoryUrl, baseUrlRefResolution.resolvedRef),
    githubRepositoryRefResolution: {
      alias: browseAlias.alias,
      resolvedRef: baseUrlRefResolution.resolvedRef,
    },
  }
}

const buildCatalogLoadResultFromCachedEnvelope = (
  envelope: RegistryCatalogCacheEnvelope,
  configuredSource: ReturnType<typeof getRegistrySourceConfig>,
  browseMetadata: BrowseCatalogLoadMetadata,
  cacheState: 'fresh' | 'stale-fallback',
  errorMessage?: string,
): RegistryCatalogLoadResult => ({
  catalog: envelope.catalog,
  indexUrl: envelope.indexUrl,
  registryBaseUrl: getRegistryBaseUrlFromIndexUrl(envelope.indexUrl, configuredSource.indexPath),
  cacheState,
  ...(errorMessage ? { errorMessage } : {}),
  ...buildCatalogLoadMetadata(
    {
      ...configuredSource,
      baseUrlRefResolution: inferBaseUrlRefResolutionFromCachedIndexUrl(
        configuredSource,
        envelope.indexUrl,
      ),
    },
    browseMetadata,
  ),
})

const resolveBrowseCatalogLoadMetadata = async (
  options: ResolveSourceOptions = {},
): Promise<BrowseCatalogLoadMetadata> => {
  try {
    return await resolveRegistryBrowseSourceMetadata(options)
  } catch {
    return getFallbackBrowseCatalogLoadMetadata()
  }
}

const resolveBrowseMetadataForFreshCache = async (
  configuredSource: ReturnType<typeof getRegistrySourceConfig>,
  cachedIndexUrl: string,
  options: ResolveSourceOptions = {},
): Promise<BrowseCatalogLoadMetadata> => {
  const inferredBrowseMetadata = inferBrowseMetadataFromCachedRef(configuredSource, cachedIndexUrl)

  if (inferredBrowseMetadata) {
    return inferredBrowseMetadata
  }

  return resolveBrowseCatalogLoadMetadata(options)
}

const isCrossOriginUrl = (url: string): boolean => {
  try {
    const pageOrigin = globalThis.location?.origin

    if (!pageOrigin) {
      return false
    }

    return new URL(url).origin !== pageOrigin
  } catch {
    return false
  }
}

const buildConditionalHeaders = (
  indexUrl: string,
  envelope: ReturnType<typeof readCatalogCacheEnvelope>,
): Record<string, string> => {
  if (isCrossOriginUrl(indexUrl)) {
    return {}
  }

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

const readFreshCachedEnvelopeForConfiguredSource = (): RegistryCatalogCacheEnvelope | null => {
  const cacheIdentity = getConfiguredSourceCacheIdentity()

  if (!cacheIdentity) {
    return null
  }

  return readFreshCatalogCacheEnvelopeForSourceIdentity(cacheIdentity)
}

const buildCatalogLoadResultOnSourceResolutionFailure = async (
  error: unknown,
  browseMetadataPromise: Promise<BrowseCatalogLoadMetadata>,
  freshCachedEnvelope: RegistryCatalogCacheEnvelope | null = null,
): Promise<RegistryCatalogLoadResult> => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown registry source resolution error'
  const configuredSource = getRegistrySourceConfig()
  const browseMetadata = await browseMetadataPromise

  if (freshCachedEnvelope) {
    return buildCatalogLoadResultFromCachedEnvelope(
      freshCachedEnvelope,
      configuredSource,
      browseMetadata,
      'fresh',
      errorMessage,
    )
  }

  const cacheIdentity = getConfiguredSourceCacheIdentity()

  if (cacheIdentity) {
    const freshEnvelope = readFreshCatalogCacheEnvelopeForSourceIdentity(cacheIdentity)

    if (freshEnvelope) {
      return buildCatalogLoadResultFromCachedEnvelope(
        freshEnvelope,
        configuredSource,
        browseMetadata,
        'fresh',
        errorMessage,
      )
    }

    const staleEnvelope = readStaleCatalogCacheEnvelopeForSourceIdentity(cacheIdentity)

    if (staleEnvelope) {
      return buildCatalogLoadResultFromCachedEnvelope(
        staleEnvelope,
        configuredSource,
        browseMetadata,
        'fresh',
        errorMessage,
      )
    }
  }

  return {
    catalog: null,
    indexUrl: '',
    registryBaseUrl: '',
    cacheState: 'none',
    errorMessage,
    ...buildCatalogLoadMetadata(configuredSource, browseMetadata),
  }
}

const loadRegistryCatalogFromFreshCache = async (
  envelope: RegistryCatalogCacheEnvelope,
  options: LoadRegistryCatalogOptions,
): Promise<RegistryCatalogLoadResult> => {
  const configuredSource = getRegistrySourceConfig()
  const browseMetadata = await resolveBrowseMetadataForFreshCache(
    configuredSource,
    envelope.indexUrl,
    {
      signal: options.signal,
      bypassTagCache: options.bypassTagCache,
    },
  )

  return buildCatalogLoadResultFromCachedEnvelope(envelope, configuredSource, browseMetadata, 'fresh')
}

const loadRegistryCatalogFromNetwork = async (
  fetchSourceConfig: Awaited<ReturnType<typeof resolveRegistryFetchSourceConfig>>,
  browseMetadataPromise: Promise<BrowseCatalogLoadMetadata>,
  options: LoadRegistryCatalogOptions,
): Promise<RegistryCatalogLoadResult> => {
  const { indexUrl, baseUrl: registryBaseUrl } = fetchSourceConfig
  const cachedCatalog = options.forceSourceResolution ? null : readFreshCatalogCache(indexUrl)

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
  const conditionalHeaders = buildConditionalHeaders(indexUrl, envelope)
  let browseMetadata: BrowseCatalogLoadMetadata | undefined

  try {
    const [result, resolvedBrowseMetadata] = await Promise.all([
      fetchCatalogFromNetwork(indexUrl, options.signal, conditionalHeaders),
      browseMetadataPromise,
    ])
    browseMetadata = resolvedBrowseMetadata
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
    const resolvedBrowseMetadata =
      browseMetadata ?? (await browseMetadataPromise.catch(() => getFallbackBrowseCatalogLoadMetadata()))
    const catalogMetadata = buildCatalogLoadMetadata(fetchSourceConfig, resolvedBrowseMetadata)

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

export const loadRegistryCatalog = async (
  options: LoadRegistryCatalogOptions = {},
): Promise<RegistryCatalogLoadResult> => {
  const freshCachedEnvelope = readFreshCachedEnvelopeForConfiguredSource()

  if (!options.forceSourceResolution && freshCachedEnvelope) {
    return loadRegistryCatalogFromFreshCache(freshCachedEnvelope, options)
  }

  const browseMetadataPromise = resolveBrowseCatalogLoadMetadata({
    signal: options.signal,
    bypassTagCache: options.bypassTagCache,
  })
  let fetchSourceConfig

  try {
    fetchSourceConfig = await resolveRegistryFetchSourceConfig({
      signal: options.signal,
      bypassTagCache: options.bypassTagCache,
    })
  } catch (error) {
    return buildCatalogLoadResultOnSourceResolutionFailure(
      error,
      browseMetadataPromise,
      freshCachedEnvelope,
    )
  }

  return loadRegistryCatalogFromNetwork(fetchSourceConfig, browseMetadataPromise, options)
}
