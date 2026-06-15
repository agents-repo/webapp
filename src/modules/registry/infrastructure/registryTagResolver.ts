import semver from 'semver'

const TAG_LIST_CACHE_STORAGE_KEY = 'registry.tags.cache.v1'
const TAG_LIST_CACHE_TTL_MS = 60 * 60 * 1000

interface GitHubTagPayload {
  readonly name: string
}

interface TagListCacheEnvelope {
  readonly cacheVersion: number
  readonly cachedAt: number
  readonly owner: string
  readonly repo: string
  readonly tagNames: string[]
}

const TAG_LIST_CACHE_VERSION = 1

const getLocalStorage = (): Storage | null => {
  try {
    return globalThis.localStorage
  } catch {
    return null
  }
}

const readTagListCache = (owner: string, repo: string): string[] | null => {
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
      envelope.owner !== owner ||
      envelope.repo !== repo ||
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

const writeTagListCache = (owner: string, repo: string, tagNames: string[]): void => {
  const storage = getLocalStorage()

  if (!storage) {
    return
  }

  const envelope: TagListCacheEnvelope = {
    cacheVersion: TAG_LIST_CACHE_VERSION,
    cachedAt: Date.now(),
    owner,
    repo,
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

const fetchGitHubTagNamesPage = async (
  url: string,
  signal: AbortSignal | undefined,
): Promise<{ tagNames: string[]; nextUrl: string | null }> => {
  const response = await fetch(url, {
    signal,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub tags request failed (${response.status} ${response.statusText})`)
  }

  const payload = (await response.json()) as GitHubTagPayload[]
  const tagNames = payload.map((entry) => entry.name).filter((name) => name.trim().length > 0)

  return {
    tagNames,
    nextUrl: parseLinkHeaderNextUrl(response.headers.get('Link')),
  }
}

export const fetchGitHubRepositoryTagNames = async (
  owner: string,
  repo: string,
  options: { signal?: AbortSignal; bypassCache?: boolean } = {},
): Promise<string[]> => {
  if (!options.bypassCache) {
    const cachedTagNames = readTagListCache(owner, repo)

    if (cachedTagNames) {
      return cachedTagNames
    }
  }

  const tagNames: string[] = []
  let nextUrl: string | null = `https://api.github.com/repos/${owner}/${repo}/tags?per_page=100`

  while (nextUrl) {
    const pageResult = await fetchGitHubTagNamesPage(nextUrl, options.signal)
    tagNames.push(...pageResult.tagNames)
    nextUrl = pageResult.nextUrl
  }

  writeTagListCache(owner, repo, tagNames)

  return tagNames
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
  options: { signal?: AbortSignal; bypassCache?: boolean } = {},
): Promise<string> => {
  const tagNames = await fetchGitHubRepositoryTagNames(owner, repo, options)
  const resolvedTag = pickLatestStableTagForMajorVersion(tagNames, major)

  if (!resolvedTag) {
    throw new Error(`No stable release tag found for major version line ${major}.x in ${owner}/${repo}`)
  }

  return resolvedTag
}
