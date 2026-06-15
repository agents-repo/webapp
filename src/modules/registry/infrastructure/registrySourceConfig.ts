import {
  buildRegistryIndexUrl,
  DEFAULT_REGISTRY_GITHUB_REPOSITORY_URL,
  DEFAULT_REGISTRY_INDEX_PATH,
  DEFAULT_REGISTRY_SOURCE_URL,
  normalizeRegistryBaseUrl,
} from './registrySourceUrl'
import {
  getStoredRegistryBaseUrlOverride,
  getStoredRegistryGitHubRepositoryUrlOverride,
} from '../application/registrySourceSettings'
import {
  extractMajorVersionLineAliasFromSourceUrl,
  inferRegistryRepositoryIdentity,
  substituteRegistryRef,
  type MajorVersionLineAlias,
} from './registryMajorVersionRef'
import { resolveLatestStableTagForMajorVersion } from './registryTagResolver'

interface RegistryImportMetaEnv {
  VITE_REGISTRY_REPOSITORY_URL?: string
  VITE_REGISTRY_BASE_URL?: string
  VITE_REGISTRY_INDEX_PATH?: string
  VITE_REGISTRY_GITHUB_REPOSITORY_URL?: string
}

export interface RegistryRefResolution {
  readonly alias: string
  readonly resolvedRef: string
}

export interface RegistrySourceConfig {
  sourceUrl: string
  configuredBaseUrl: string
  runtimeBaseUrlOverride: string | null
  baseUrl: string
  indexPath: string
  indexUrl: string
  sourceMode: 'configured' | 'runtime-override'
  configuredGithubRepositoryUrl: string
  runtimeGithubRepositoryUrlOverride: string | null
  githubRepositoryUrl: string
  githubRepositorySourceMode: 'configured' | 'runtime-override'
  baseUrlRefResolution: RegistryRefResolution | null
  githubRepositoryRefResolution: RegistryRefResolution | null
}

interface ResolveSourceUrlOptions {
  readonly signal?: AbortSignal
  readonly bypassTagCache?: boolean
}

const buildRegistrySourceConfig = (input: {
  sourceUrl: string
  configuredBaseUrl: string
  runtimeBaseUrlOverride: string | null
  baseUrl: string
  indexPath: string
  sourceMode: 'configured' | 'runtime-override'
  configuredGithubRepositoryUrl: string
  runtimeGithubRepositoryUrlOverride: string | null
  githubRepositoryUrl: string
  githubRepositorySourceMode: 'configured' | 'runtime-override'
  baseUrlRefResolution: RegistryRefResolution | null
  githubRepositoryRefResolution: RegistryRefResolution | null
}): RegistrySourceConfig => {
  return {
    ...input,
    indexUrl: buildRegistryIndexUrl(input.baseUrl, input.indexPath),
  }
}

export const getConfiguredRegistrySourceConfig = (): RegistrySourceConfig => {
  const env = import.meta.env as RegistryImportMetaEnv
  const sourceUrl = env.VITE_REGISTRY_REPOSITORY_URL?.trim() || DEFAULT_REGISTRY_SOURCE_URL
  const configuredBaseUrl = env.VITE_REGISTRY_BASE_URL?.trim() || sourceUrl
  const indexPath = env.VITE_REGISTRY_INDEX_PATH?.trim() || DEFAULT_REGISTRY_INDEX_PATH
  const configuredGithubRepositoryUrl =
    env.VITE_REGISTRY_GITHUB_REPOSITORY_URL?.trim() || DEFAULT_REGISTRY_GITHUB_REPOSITORY_URL
  const baseUrl = normalizeRegistryBaseUrl(configuredBaseUrl)

  return buildRegistrySourceConfig({
    sourceUrl,
    configuredBaseUrl,
    runtimeBaseUrlOverride: null,
    baseUrl,
    indexPath,
    sourceMode: 'configured',
    configuredGithubRepositoryUrl,
    runtimeGithubRepositoryUrlOverride: null,
    githubRepositoryUrl: configuredGithubRepositoryUrl,
    githubRepositorySourceMode: 'configured',
    baseUrlRefResolution: null,
    githubRepositoryRefResolution: null,
  })
}

export const getRegistrySourceConfig = (): RegistrySourceConfig => {
  const configuredSource = getConfiguredRegistrySourceConfig()
  const runtimeBaseUrlOverride = getStoredRegistryBaseUrlOverride()
  const runtimeGithubRepositoryUrlOverride = getStoredRegistryGitHubRepositoryUrlOverride()
  const githubRepositoryUrl =
    runtimeGithubRepositoryUrlOverride ?? configuredSource.configuredGithubRepositoryUrl
  const githubRepositorySourceMode = runtimeGithubRepositoryUrlOverride ? 'runtime-override' : 'configured'

  if (!runtimeBaseUrlOverride) {
    return buildRegistrySourceConfig({
      ...configuredSource,
      runtimeGithubRepositoryUrlOverride,
      githubRepositoryUrl,
      githubRepositorySourceMode,
    })
  }

  const runtimeBaseUrl = normalizeRegistryBaseUrl(runtimeBaseUrlOverride)

  return buildRegistrySourceConfig({
    ...configuredSource,
    runtimeBaseUrlOverride,
    baseUrl: runtimeBaseUrl,
    sourceMode: 'runtime-override',
    runtimeGithubRepositoryUrlOverride,
    githubRepositoryUrl,
    githubRepositorySourceMode,
  })
}

const resolveSourceUrlWithAlias = async (
  sourceUrl: string,
  fallbackRepositoryUrl: string,
  alias: MajorVersionLineAlias,
  options: ResolveSourceUrlOptions,
): Promise<{ resolvedSourceUrl: string; resolution: RegistryRefResolution }> => {
  const repositoryIdentity = inferRegistryRepositoryIdentity(sourceUrl, fallbackRepositoryUrl)

  if (!repositoryIdentity) {
    throw new Error('Could not infer a GitHub repository for major-version line ref resolution.')
  }

  const resolvedRef = await resolveLatestStableTagForMajorVersion(
    repositoryIdentity.owner,
    repositoryIdentity.repo,
    alias.major,
    {
      signal: options.signal,
      bypassCache: options.bypassTagCache,
      sourceUrl,
      fallbackRepositoryUrl,
    },
  )

  return {
    resolvedSourceUrl: substituteRegistryRef(sourceUrl, resolvedRef),
    resolution: {
      alias: alias.alias,
      resolvedRef,
    },
  }
}

const resolveRegistryBaseSourceUrl = async (
  configuredSource: RegistrySourceConfig,
  options: ResolveSourceUrlOptions,
): Promise<{
  baseUrlInput: string
  baseUrlRefResolution: RegistryRefResolution | null
}> => {
  const baseUrlInput =
    configuredSource.runtimeBaseUrlOverride ??
    configuredSource.configuredBaseUrl
  const alias = extractMajorVersionLineAliasFromSourceUrl(baseUrlInput)

  if (!alias) {
    return {
      baseUrlInput,
      baseUrlRefResolution: null,
    }
  }

  const resolved = await resolveSourceUrlWithAlias(
    baseUrlInput,
    configuredSource.configuredGithubRepositoryUrl,
    alias,
    options,
  )

  return {
    baseUrlInput: resolved.resolvedSourceUrl,
    baseUrlRefResolution: resolved.resolution,
  }
}

const resolveGithubRepositorySourceUrl = async (
  configuredSource: RegistrySourceConfig,
  options: ResolveSourceUrlOptions,
): Promise<{
  githubRepositoryUrl: string
  githubRepositoryRefResolution: RegistryRefResolution | null
}> => {
  const githubRepositoryUrl = configuredSource.githubRepositoryUrl
  const alias = extractMajorVersionLineAliasFromSourceUrl(githubRepositoryUrl)

  if (!alias) {
    return {
      githubRepositoryUrl,
      githubRepositoryRefResolution: null,
    }
  }

  const resolved = await resolveSourceUrlWithAlias(
    githubRepositoryUrl,
    configuredSource.configuredGithubRepositoryUrl,
    alias,
    options,
  )

  return {
    githubRepositoryUrl: resolved.resolvedSourceUrl,
    githubRepositoryRefResolution: resolved.resolution,
  }
}

export const resolveRegistrySourceConfig = async (
  options: ResolveSourceUrlOptions = {},
): Promise<RegistrySourceConfig> => {
  const configuredSource = getRegistrySourceConfig()
  const [baseSourceResolution, githubRepositoryResolution] = await Promise.all([
    resolveRegistryBaseSourceUrl(configuredSource, options),
    resolveGithubRepositorySourceUrl(configuredSource, options),
  ])

  const baseUrl = normalizeRegistryBaseUrl(baseSourceResolution.baseUrlInput)

  return buildRegistrySourceConfig({
    ...configuredSource,
    baseUrl,
    githubRepositoryUrl: githubRepositoryResolution.githubRepositoryUrl,
    baseUrlRefResolution: baseSourceResolution.baseUrlRefResolution,
    githubRepositoryRefResolution: githubRepositoryResolution.githubRepositoryRefResolution,
  })
}

export const validateRegistrySourceUrlForMajorVersionAlias = async (
  sourceUrl: string,
  fallbackRepositoryUrl: string,
  options: ResolveSourceUrlOptions = {},
): Promise<string | null> => {
  const alias = extractMajorVersionLineAliasFromSourceUrl(sourceUrl)

  if (!alias) {
    return null
  }

  try {
    await resolveSourceUrlWithAlias(sourceUrl, fallbackRepositoryUrl, alias, options)
    return null
  } catch (error) {
    return error instanceof Error ? error.message : 'Unable to resolve major-version line ref.'
  }
}
