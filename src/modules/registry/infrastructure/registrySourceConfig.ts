import {
  buildRegistryIndexUrl,
  DEFAULT_REGISTRY_INDEX_PATH,
  DEFAULT_REGISTRY_REPOSITORY_URL,
  normalizeRegistryBaseUrl,
} from './registrySourceUrl'
import { getStoredRegistryBaseUrlOverride } from '../application/registrySourceSettings'

interface RegistryImportMetaEnv {
  VITE_REGISTRY_REPOSITORY_URL?: string
  VITE_REGISTRY_BASE_URL?: string
  VITE_REGISTRY_INDEX_PATH?: string
}

export interface RegistrySourceConfig {
  repositoryUrl: string
  configuredBaseUrl: string
  runtimeBaseUrlOverride: string | null
  baseUrl: string
  indexPath: string
  indexUrl: string
  sourceMode: 'configured' | 'runtime-override'
}

export const getConfiguredRegistrySourceConfig = (): RegistrySourceConfig => {
  const env = import.meta.env as RegistryImportMetaEnv
  const repositoryUrl = env.VITE_REGISTRY_REPOSITORY_URL?.trim() || DEFAULT_REGISTRY_REPOSITORY_URL
  const configuredBaseUrl = env.VITE_REGISTRY_BASE_URL?.trim() || repositoryUrl
  const indexPath = env.VITE_REGISTRY_INDEX_PATH?.trim() || DEFAULT_REGISTRY_INDEX_PATH
  const baseUrl = normalizeRegistryBaseUrl(configuredBaseUrl)

  return {
    repositoryUrl,
    configuredBaseUrl,
    runtimeBaseUrlOverride: null,
    baseUrl,
    indexPath,
    indexUrl: buildRegistryIndexUrl(baseUrl, indexPath),
    sourceMode: 'configured',
  }
}

export const getRegistrySourceConfig = (): RegistrySourceConfig => {
  const configuredSource = getConfiguredRegistrySourceConfig()
  const runtimeBaseUrlOverride = getStoredRegistryBaseUrlOverride()

  if (!runtimeBaseUrlOverride) {
    return configuredSource
  }

  const runtimeBaseUrl = normalizeRegistryBaseUrl(runtimeBaseUrlOverride)

  return {
    ...configuredSource,
    runtimeBaseUrlOverride,
    baseUrl: runtimeBaseUrl,
    indexUrl: buildRegistryIndexUrl(runtimeBaseUrl, configuredSource.indexPath),
    sourceMode: 'runtime-override',
  }
}
