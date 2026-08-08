import { getRepositoryBySlug, getRepositorySlugs } from './repositories/repositoryManifest.ts'

export const REPOSITORIES_BASE_PATH = '/repositories'

export function getRepositoryDetailPath(slug: string): string {
  return `${REPOSITORIES_BASE_PATH}/${slug}`
}

export function getRepositoryDetailRoutePaths(): string[] {
  return getRepositorySlugs().map((slug) => getRepositoryDetailPath(slug))
}

export function getRepositoryNestedRoutePaths(): string[] {
  return [REPOSITORIES_BASE_PATH, ...getRepositoryDetailRoutePaths()]
}

export function parseRepositorySlugFromPathname(pathname: string): string | undefined {
  const normalized =
    pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname

  if (normalized === REPOSITORIES_BASE_PATH) {
    return undefined
  }

  const prefix = `${REPOSITORIES_BASE_PATH}/`
  if (!normalized.startsWith(prefix)) {
    return undefined
  }

  const slug = normalized.slice(prefix.length)
  if (!slug || slug.includes('/')) {
    return undefined
  }

  return getRepositoryBySlug(slug) ? slug : undefined
}

export function isRepositorySitePath(pathname: string): boolean {
  const normalized =
    pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname

  if (normalized === REPOSITORIES_BASE_PATH) {
    return true
  }

  return parseRepositorySlugFromPathname(normalized) !== undefined
}
