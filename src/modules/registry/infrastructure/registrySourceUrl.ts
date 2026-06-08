export const DEFAULT_REGISTRY_BRANCH = 'main'
export const DEFAULT_REGISTRY_SOURCE_URL = `https://registry-proxy.maiconfz.workers.dev?ref=${DEFAULT_REGISTRY_BRANCH}`
export const DEFAULT_REGISTRY_GITHUB_REPOSITORY_URL = 'https://github.com/agents-repo/registry'
export const DEFAULT_REGISTRY_INDEX_PATH = 'packages/index.json'
const GITHUB_HOSTNAME = 'github.com'
const GITHUB_WWW_HOSTNAME = 'www.github.com'
const GITHUB_BRANCH_PATH_MARKERS = new Set(['blob', 'tree'])

const GITHUB_EXPLICIT_REF_PREFIX = 'refs'
const GITHUB_EXPLICIT_REF_TYPES = new Set(['heads', 'tags'])

const getGitHubRefFromSegments = (segments: string[]): string => {
  if (segments.length < 4 || !GITHUB_BRANCH_PATH_MARKERS.has(segments[2])) {
    return DEFAULT_REGISTRY_BRANCH
  }

  const refSegments = segments.slice(3).filter((segment) => segment.length > 0)

  if (refSegments.length === 0) {
    return DEFAULT_REGISTRY_BRANCH
  }

  // GitHub tree/blob URLs can include additional path segments after the ref.
  // Use the first segment by default, and only join slash refs when explicitly prefixed.
  if (
    refSegments.length >= 3 &&
    refSegments[0] === GITHUB_EXPLICIT_REF_PREFIX &&
    GITHUB_EXPLICIT_REF_TYPES.has(refSegments[1])
  ) {
    const explicitRef = refSegments.slice(2).join('/').trim()
    return explicitRef.length > 0 ? explicitRef : DEFAULT_REGISTRY_BRANCH
  }

  return refSegments[0]
}

const stripGitRepositorySuffix = (value: string): string => {
  return value.replace(/\.git$/i, '')
}

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

    if (
      (parsedUrl.hostname !== GITHUB_HOSTNAME && parsedUrl.hostname !== GITHUB_WWW_HOSTNAME) ||
      segments.length < 2
    ) {
      return normalized
    }

    const owner = segments[0]
    const repository = stripGitRepositorySuffix(segments[1])
    const branch = getGitHubRefFromSegments(segments)

    return `https://raw.githubusercontent.com/${owner}/${repository}/${branch}`
  } catch {
    return normalized
  }
}

export const buildRegistryIndexUrl = (baseUrl: string, indexPath: string): string => {
  const normalizedBase = trimTrailingSlashes(baseUrl.trim())
  const normalizedPath = trimLeadingSlashes(indexPath)

  try {
    const parsedBaseUrl = new URL(normalizedBase)
    parsedBaseUrl.pathname = `${trimTrailingSlashes(parsedBaseUrl.pathname)}/${normalizedPath}`
    return parsedBaseUrl.toString()
  } catch {
    // Keep non-URL-compatible values working for testability and loose input handling.
  }

  return `${normalizedBase}/${normalizedPath}`
}

export const buildRegistryArtifactPath = (
  packageId: string,
  version: string,
  targetId: string,
): string => `packages/${packageId}/versions/${version}/${version}-${targetId}.zip`

export const buildRegistryArtifactUrl = (
  baseUrl: string,
  packageId: string,
  version: string,
  targetId: string,
): string => buildRegistryIndexUrl(baseUrl, buildRegistryArtifactPath(packageId, version, targetId))

const isGitHubHostname = (hostname: string): boolean => {
  return hostname === GITHUB_HOSTNAME || hostname === GITHUB_WWW_HOSTNAME
}

export const buildRegistryPackageBrowseUrl = (
  githubRepositoryUrl: string,
  packageId: string,
): string | null => {
  const normalizedPackageId = packageId.trim()

  if (normalizedPackageId.length === 0) {
    return null
  }

  try {
    const parsedUrl = new URL(trimTrailingSlashes(githubRepositoryUrl.trim()))
    const segments = parsedUrl.pathname.split('/').filter((segment) => segment.length > 0)

    if (!isGitHubHostname(parsedUrl.hostname) || segments.length < 2) {
      return null
    }

    const owner = segments[0]
    const repository = stripGitRepositorySuffix(segments[1])
    const branch = getGitHubRefFromSegments(segments)

    return `https://github.com/${owner}/${repository}/tree/${branch}/packages/${normalizedPackageId}`
  } catch {
    return null
  }
}
