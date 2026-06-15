import semver from 'semver'

import { inferRegistryRepositoryIdentity } from './registryMajorVersionRef'

const TAG_LIST_CACHE_STORAGE_KEY = 'registry.tags.cache.v1'
const TAG_LIST_CACHE_TTL_MS = 60 * 60 * 1000

interface GitHubTagPayload {
  readonly name: string
}

interface TagListCacheEnvelope {
  readonly cacheVersion: number
  readonly cachedAt: number
  readonly tagsUrl: string
  readonly tagNames: string[]
}

const TAG_LIST_CACHE_VERSION = 2

const GITHUB_HOSTNAMES = new Set(['github.com', 'www.github.com', 'raw.githubusercontent.com'])

const getLocalStorage = (): Storage | null => {
  try {
    return globalThis.localStorage
  } catch {
    return null
  }
}

const readTagListCache = (tagsUrl: string): string[] | null => {
  const storage = getLocalStorage()

  if (!storage) {
    return null
  }

  try {
    const rawValue = storage.getItem(TAG_LIST_CACHE_STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    const envelope = JSON.parse(rawValue) as TagListCacheEnvelope

    if (
      envelope.cacheVersion !== TAG_LIST_CACHE_VERSION ||
      envelope.tagsUrl !== tagsUrl ||
      !Array.isArray(envelope.tagNames)
    ) {
      return null
    }

    if (Date.now() - envelope.cachedAt > TAG_LIST_CACHE_TTL_MS) {
      return null
    }

    return envelope.tagNames
  } catch {
    return null
  }
}

const writeTagListCache = (tagsUrl: string, tagNames: string[]): void => {
  const storage = getLocalStorage()

  if (!storage) {
    return
  }

  const envelope: TagListCacheEnvelope = {
    cacheVersion: TAG_LIST_CACHE_VERSION,
    cachedAt: Date.now(),
    tagsUrl,
    tagNames,
  }

  try {
    storage.setItem(TAG_LIST_CACHE_STORAGE_KEY, JSON.stringify(envelope))
  } catch {
    // Ignore storage failures; caching is best-effort.
  }
}

export const clearRegistryTagListCache = (): void => {
  const storage = getLocalStorage()

  if (!storage) {
    return
  }

  try {
    storage.removeItem(TAG_LIST_CACHE_STORAGE_KEY)
  } catch {
    // Ignore storage failures.
  }
}

export const buildRegistryTagsUrl = (sourceUrl: string, fallbackRepositoryUrl: string): string => {
  const normalizedSourceUrl = sourceUrl.trim()

  if (normalizedSourceUrl.length > 0) {
    try {
      const parsedSourceUrl = new URL(normalizedSourceUrl)

      if (!GITHUB_HOSTNAMES.has(parsedSourceUrl.hostname)) {
        return `${parsedSourceUrl.origin}/tags`
      }
    } catch {
      // Fall through to GitHub API URL derivation.
    }
  }

  const repositoryIdentity = inferRegistryRepositoryIdentity(sourceUrl, fallbackRepositoryUrl)

  if (!repositoryIdentity) {
    throw new Error('Could not infer a GitHub repository for tag listing.')
  }

  return `https://api.github.com/repos/${repositoryIdentity.owner}/${repositoryIdentity.repo}/tags?per_page=100`
}

const isGitHubTagsApiUrl = (tagsUrl: string): boolean => {
  try {
    return new URL(tagsUrl).hostname === 'api.github.com'
  } catch {
    return false
  }
}

const parseLinkHeaderNextUrl = (linkHeader: string | null): string | null => {
  if (!linkHeader) {
    return null
  }

  const nextLink = linkHeader
    .split(',')
    .map((entry) => entry.trim())
    .find((entry) => entry.endsWith('rel="next"'))

  if (!nextLink) {
    return null
  }

  const match = /^<([^>]+)>/.exec(nextLink)
  return match?.[1] ?? null
}

const parseTagNamesPayload = (payload: GitHubTagPayload[]): string[] => {
  return payload.map((entry) => entry.name).filter((name) => name.trim().length > 0)
}

const fetchRegistryTagNamesPage = async (
  url: string,
  signal: AbortSignal | undefined,
): Promise<{ tagNames: string[]; nextUrl: string | null }> => {
  const headers: Record<string, string> = {}

  if (isGitHubTagsApiUrl(url)) {
    headers.Accept = 'application/vnd.github+json'
    headers['X-GitHub-Api-Version'] = '2022-11-28'
  }

  const response = await fetch(url, {
    signal,
    headers,
  })

  if (!response.ok) {
    throw new Error(`Registry tags request failed (${response.status} ${response.statusText})`)
  }

  const payload = (await response.json()) as GitHubTagPayload[]

  return {
    tagNames: parseTagNamesPayload(payload),
    nextUrl: isGitHubTagsApiUrl(url) ? parseLinkHeaderNextUrl(response.headers.get('Link')) : null,
  }
}

export const fetchRegistryRepositoryTagNames = async (
  tagsUrl: string,
  options: { signal?: AbortSignal; bypassCache?: boolean } = {},
): Promise<string[]> => {
  if (!options.bypassCache) {
    const cachedTagNames = readTagListCache(tagsUrl)

    if (cachedTagNames) {
      return cachedTagNames
    }
  }

  const tagNames: string[] = []
  let nextUrl: string | null = tagsUrl

  while (nextUrl) {
    const pageResult = await fetchRegistryTagNamesPage(nextUrl, options.signal)
    tagNames.push(...pageResult.tagNames)
    nextUrl = pageResult.nextUrl
  }

  writeTagListCache(tagsUrl, tagNames)

  return tagNames
}

export const fetchGitHubRepositoryTagNames = async (
  owner: string,
  repo: string,
  options: { signal?: AbortSignal; bypassCache?: boolean } = {},
): Promise<string[]> => {
  return fetchRegistryRepositoryTagNames(
    `https://api.github.com/repos/${owner}/${repo}/tags?per_page=100`,
    options,
  )
}

export const pickLatestStableTagForMajorVersion = (
  tagNames: readonly string[],
  major: number,
): string | null => {
  const stableTags = tagNames
    .map((tag) => ({
      tag,
      version: semver.valid(semver.coerce(tag, { loose: true })),
    }))
    .filter((entry): entry is { tag: string; version: string } => {
      return entry.version !== null && semver.prerelease(entry.version) === null
    })

  const versions = stableTags.map((entry) => entry.version)
  const bestVersion = semver.maxSatisfying(versions, `${major}.x`)

  if (!bestVersion) {
    return null
  }

  return stableTags.find((entry) => entry.version === bestVersion)?.tag ?? null
}

export const resolveLatestStableTagForMajorVersion = async (
  owner: string,
  repo: string,
  major: number,
  options: {
    signal?: AbortSignal
    bypassCache?: boolean
    sourceUrl?: string
    fallbackRepositoryUrl?: string
  } = {},
): Promise<string> => {
  const tagsUrl =
    options.sourceUrl && options.fallbackRepositoryUrl
      ? buildRegistryTagsUrl(options.sourceUrl, options.fallbackRepositoryUrl)
      : `https://api.github.com/repos/${owner}/${repo}/tags?per_page=100`

  const tagNames = await fetchRegistryRepositoryTagNames(tagsUrl, options)
  const resolvedTag = pickLatestStableTagForMajorVersion(tagNames, major)

  if (!resolvedTag) {
    throw new Error(`No stable release tag found for major version line ${major}.x in ${owner}/${repo}`)
  }

  return resolvedTag
}
