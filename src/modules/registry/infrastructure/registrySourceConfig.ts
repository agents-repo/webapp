import {
  buildRegistryIndexUrl,
  DEFAULT_REGISTRY_INDEX_PATH,
  DEFAULT_REGISTRY_REPOSITORY_URL,
  normalizeRegistryBaseUrl,
} from './registrySourceUrl'

interface RegistryImportMetaEnv {
  VITE_REGISTRY_REPOSITORY_URL?: string
  VITE_REGISTRY_BASE_URL?: string
  VITE_REGISTRY_INDEX_PATH?: string
}

interface RegistrySourceConfig {
  repositoryUrl: string
  baseUrl: string
  indexPath: string
  indexUrl: string
}

export const getRegistrySourceConfig = (): RegistrySourceConfig => {
  const env = import.meta.env as RegistryImportMetaEnv
  const repositoryUrl = env.VITE_REGISTRY_REPOSITORY_URL?.trim() || DEFAULT_REGISTRY_REPOSITORY_URL
  const configuredBaseUrl = env.VITE_REGISTRY_BASE_URL?.trim() || repositoryUrl
  const indexPath = env.VITE_REGISTRY_INDEX_PATH?.trim() || DEFAULT_REGISTRY_INDEX_PATH
  const baseUrl = normalizeRegistryBaseUrl(configuredBaseUrl)

  return {
    repositoryUrl,
    baseUrl,
    indexPath,
    indexUrl: buildRegistryIndexUrl(baseUrl, indexPath),
  }
}
