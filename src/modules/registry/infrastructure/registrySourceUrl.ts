export const DEFAULT_REGISTRY_REPOSITORY_URL = 'https://github.com/agents-repo/registry'
export const DEFAULT_REGISTRY_INDEX_PATH = 'packages/index.json'
export const DEFAULT_REGISTRY_BRANCH = 'main'
const GITHUB_HOSTNAME = 'github.com'

export const trimTrailingSlashes = (value: string): string => {
  let output = value

  while (output.endsWith('/')) {
    output = output.slice(0, -1)
  }

  return output
}

export const trimLeadingSlashes = (value: string): string => {
  let output = value

  while (output.startsWith('/')) {
    output = output.slice(1)
  }

  return output
}

export const normalizeRegistryBaseUrl = (value: string): string => {
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

export const buildRegistryIndexUrl = (baseUrl: string, indexPath: string): string => {
  const normalizedBase = trimTrailingSlashes(baseUrl)
  const normalizedPath = trimLeadingSlashes(indexPath)

  return `${normalizedBase}/${normalizedPath}`
}
