import { describe, expect, it } from 'vitest'
import { sampleRegistryCatalog } from '../../../../test/fixtures/sampleRegistryCatalog'
import type { RegistryPackage } from '../../domain/package'
import {
  getCatalogAlertState,
  getCatalogResultsSummary,
  getCatalogStatusTag,
  getPackageDownloadTargets,
} from './homePageCatalogState'

const samplePackage: RegistryPackage = sampleRegistryCatalog.packages[0]

describe('getCatalogStatusTag', () => {
  it('returns loading while the catalog request is in flight', () => {
    expect(
      getCatalogStatusTag({
        catalog: null,
        cacheState: 'none',
        isLoading: true,
        errorMessage: null,
      }),
    ).toBe('loading')
  })

  it('returns unavailable when no catalog is loaded', () => {
    expect(
      getCatalogStatusTag({
        catalog: null,
        cacheState: 'none',
        isLoading: false,
        errorMessage: 'failed',
      }),
    ).toBe('unavailable')
  })

  it('describes fresh cache and stale fallback states', () => {
    expect(
      getCatalogStatusTag({
        catalog: sampleRegistryCatalog,
        cacheState: 'fresh',
        isLoading: false,
        errorMessage: null,
      }),
    ).toBe('fresh cache')

    expect(
      getCatalogStatusTag({
        catalog: sampleRegistryCatalog,
        cacheState: 'fresh',
        isLoading: false,
        errorMessage: 'resolution failed',
      }),
    ).toBe('cached catalog after source resolution failure')

    expect(
      getCatalogStatusTag({
        catalog: sampleRegistryCatalog,
        cacheState: 'stale-fallback',
        isLoading: false,
        errorMessage: 'refresh failed',
      }),
    ).toBe('stale cache after refresh failure')
  })
})

describe('getCatalogAlertState', () => {
  it('returns null when there is no error message', () => {
    expect(
      getCatalogAlertState({
        hasCatalog: true,
        cacheState: 'fresh',
        errorMessage: null,
      }),
    ).toBeNull()
  })

  it('returns a danger alert when no catalog is available', () => {
    expect(
      getCatalogAlertState({
        hasCatalog: false,
        cacheState: 'none',
        errorMessage: 'network error',
      }),
    ).toEqual({
      variant: 'danger',
      message: 'Unable to load the registry index. No catalog data is available.',
    })
  })

  it('returns warning alerts for recoverable cache fallbacks', () => {
    expect(
      getCatalogAlertState({
        hasCatalog: true,
        cacheState: 'stale-fallback',
        errorMessage: 'refresh failed',
      })?.message,
    ).toContain('stale cached catalog')

    expect(
      getCatalogAlertState({
        hasCatalog: true,
        cacheState: 'fresh',
        errorMessage: 'resolution failed',
      })?.message,
    ).toContain('cached catalog')
  })
})

describe('getCatalogResultsSummary', () => {
  it('summarizes filtered package counts', () => {
    expect(
      getCatalogResultsSummary({
        catalog: sampleRegistryCatalog,
        filteredCount: 1,
        isLoading: false,
      }),
    ).toBe('Showing 1 of 1 packages')
  })

  it('reports loading and empty states', () => {
    expect(
      getCatalogResultsSummary({
        catalog: null,
        filteredCount: 0,
        isLoading: true,
      }),
    ).toBe('Loading registry catalog')

    expect(
      getCatalogResultsSummary({
        catalog: null,
        filteredCount: 0,
        isLoading: false,
      }),
    ).toBe('No catalog data available')
  })
})

describe('getPackageDownloadTargets', () => {
  it('returns safe http download targets for install targets', () => {
    const targets = getPackageDownloadTargets(
      samplePackage,
      'https://raw.githubusercontent.com/agents-repo/registry/main',
    )

    expect(targets).toHaveLength(1)
    expect(targets[0]?.id).toBe('cursor')
    expect(targets[0]?.href).toContain('packages/agents-repo/sample-agent')
    expect(targets[0]?.href.startsWith('https://')).toBe(true)
  })

  it('filters unsafe URLs and returns empty when base URL is blank', () => {
    expect(getPackageDownloadTargets(samplePackage, '')).toEqual([])
    expect(getPackageDownloadTargets(samplePackage, '   ')).toEqual([])
  })
})
