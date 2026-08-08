import { describe, expect, it } from 'vitest'
import { getRepositorySlugs } from './repositories/repositoryManifest.ts'
import {
  getRepositoryDetailPath,
  getRepositoryNestedRoutePaths,
  isUnlistedRepositoryDetailPath,
  parseRepositorySlugFromPathname,
  REPOSITORIES_BASE_PATH,
} from './nestedSiteRoutes.ts'
describe('nestedSiteRoutes', () => {
  it('builds detail paths under the repositories base', () => {
    expect(getRepositoryDetailPath('registry')).toBe('/repositories/registry')
    expect(REPOSITORIES_BASE_PATH).toBe('/repositories')
  })

  it('includes index and every manifest slug in nested paths', () => {
    const paths = getRepositoryNestedRoutePaths()
    expect(paths[0]).toBe('/repositories')
    expect(paths).toContain('/repositories/cli')
    expect(paths).toHaveLength(1 + getRepositorySlugs().length)
  })

  it('parses known repository slugs only', () => {
    expect(parseRepositorySlugFromPathname('/repositories/registry')).toBe('registry')
    expect(parseRepositorySlugFromPathname('/repositories/registry/')).toBe('registry')
    expect(parseRepositorySlugFromPathname('/repositories')).toBeUndefined()
    expect(parseRepositorySlugFromPathname('/repositories/unknown')).toBeUndefined()
  })

  it('detects unlisted repository detail paths', () => {
    expect(isUnlistedRepositoryDetailPath('/repositories')).toBe(false)
    expect(isUnlistedRepositoryDetailPath('/repositories/webapp')).toBe(false)
    expect(isUnlistedRepositoryDetailPath('/repositories/unknown')).toBe(true)
    expect(isUnlistedRepositoryDetailPath('/repositories/foo/bar')).toBe(true)
    expect(isUnlistedRepositoryDetailPath('/about')).toBe(false)
  })
})
