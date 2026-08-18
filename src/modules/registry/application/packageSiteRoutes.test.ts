import { afterEach, describe, expect, it } from 'vitest'
import { sampleRegistryCatalog } from '../../../test/fixtures/sampleRegistryCatalog'
import {
  buildPackageSiteRoutesFromCatalog,
  getPackageDetailPath,
  isKnownPackageSiteRoute,
  isPackageSitePathCatalogMember,
  isUnlistedPackageSitePath,
  parsePackageSitePath,
} from './packageSiteRoutes'
import { resetRuntimePackageCatalogForTests } from './runtimePackageCatalog'

describe('packageSiteRoutes', () => {
  afterEach(() => {
    resetRuntimePackageCatalogForTests()
  })

  it('parses index, namespace, and detail paths', () => {
    expect(parsePackageSitePath('/packages')).toEqual({ kind: 'index' })
    expect(parsePackageSitePath('/packages/agents-repo')).toEqual({
      kind: 'namespace',
      namespace: 'agents-repo',
    })
    expect(parsePackageSitePath('/packages/agents-repo/sample-agent')).toEqual({
      kind: 'detail',
      namespace: 'agents-repo',
      packageId: 'sample-agent',
    })
    expect(parsePackageSitePath('/packages/agents-repo/sample-agent/extra')).toBeUndefined()
  })

  it('treats valid package paths as known while the catalog is unresolved', () => {
    expect(isKnownPackageSiteRoute('/packages/agents-repo/sample-agent', null, false)).toBe(true)
    expect(isUnlistedPackageSitePath('/packages/agents-repo/sample-agent/extra', null, false)).toBe(true)
  })

  it('requires catalog membership after the catalog resolves', () => {
    expect(isKnownPackageSiteRoute('/packages/agents-repo/sample-agent', sampleRegistryCatalog, true)).toBe(
      true,
    )
    expect(isKnownPackageSiteRoute('/packages/missing-ns', sampleRegistryCatalog, true)).toBe(false)
    expect(isKnownPackageSiteRoute('/packages/agents-repo/missing-pkg', sampleRegistryCatalog, true)).toBe(
      false,
    )
  })

  it('treats index and extra-segment paths as catalog-satisfied', () => {
    expect(isPackageSitePathCatalogMember('/packages', sampleRegistryCatalog)).toBe(true)
    expect(
      isPackageSitePathCatalogMember('/packages/agents-repo/sample-agent/extra', sampleRegistryCatalog),
    ).toBe(true)
  })

  it('requires namespace and detail membership in the loaded catalog', () => {
    expect(isPackageSitePathCatalogMember('/packages/agents-repo', sampleRegistryCatalog)).toBe(true)
    expect(
      isPackageSitePathCatalogMember('/packages/agents-repo/sample-agent', sampleRegistryCatalog),
    ).toBe(true)
    expect(isPackageSitePathCatalogMember('/packages/missing-ns', sampleRegistryCatalog)).toBe(false)
    expect(
      isPackageSitePathCatalogMember('/packages/agents-repo/missing-pkg', sampleRegistryCatalog),
    ).toBe(false)
    expect(isPackageSitePathCatalogMember('/packages/agents-repo/missing-pkg', null)).toBe(false)
  })

  it('builds namespace and detail routes from the catalog', () => {
    expect(buildPackageSiteRoutesFromCatalog(sampleRegistryCatalog)).toEqual([
      '/packages/agents-repo',
      getPackageDetailPath('agents-repo', 'sample-agent'),
    ])
  })
})
