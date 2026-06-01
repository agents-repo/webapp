const DEFAULT_REGISTRY_REPOSITORY_URL = 'https://github.com/agents-repo/registry'
const DEFAULT_REGISTRY_INDEX_PATH = 'packages/index.json'
const DEFAULT_REGISTRY_BRANCH = 'main'
const GITHUB_HOSTNAME = 'github.com'

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

const trimTrailingSlashes = (value: string): string => {
  let output = value

  while (output.endsWith('/')) {
    output = output.slice(0, -1)
  }

  return output
}

const trimLeadingSlashes = (value: string): string => {
  let output = value

  while (output.startsWith('/')) {
    output = output.slice(1)
  }

  return output
}

const normalizeRegistryBaseUrl = (value: string): string => {
  const normalized = trimTrailingSlashes(value.trim())

  try {
    const parsedUrl = new URL(normalized)
    const segments = parsedUrl.pathname.split('/').filter((segment) => segment.length > 0)

    if (parsedUrl.hostname !== GITHUB_HOSTNAME || segments.length < 2) {
      return normalized
    }

    const owner = segments[0]
    const repository = segments[1]
    const branch =
      segments.length >= 4 && segments[2] === 'blob' ? segments[3] : DEFAULT_REGISTRY_BRANCH

    return `https://raw.githubusercontent.com/${owner}/${repository}/${branch}`
  } catch {
    return normalized
  }
}

const buildIndexUrl = (baseUrl: string, indexPath: string): string => {
  const normalizedBase = trimTrailingSlashes(baseUrl)
  const normalizedPath = trimLeadingSlashes(indexPath)

  return `${normalizedBase}/${normalizedPath}`
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
    indexUrl: buildIndexUrl(baseUrl, indexPath),
  }
}
