import { describe, expect, it } from 'vitest'
import {
  getRepositoryDetailPath,
  getRepositoryNestedRoutePaths,
  isRepositorySitePath,
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
    expect(paths).toHaveLength(7)
  })

  it('parses known repository slugs only', () => {
    expect(parseRepositorySlugFromPathname('/repositories/registry')).toBe('registry')
    expect(parseRepositorySlugFromPathname('/repositories/registry/')).toBe('registry')
    expect(parseRepositorySlugFromPathname('/repositories')).toBeUndefined()
    expect(parseRepositorySlugFromPathname('/repositories/unknown')).toBeUndefined()
  })

  it('detects repository site paths', () => {
    expect(isRepositorySitePath('/repositories')).toBe(true)
    expect(isRepositorySitePath('/repositories/webapp')).toBe(true)
    expect(isRepositorySitePath('/repositories/unknown')).toBe(false)
    expect(isRepositorySitePath('/about')).toBe(false)
  })
})
