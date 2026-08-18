import { describe, expect, it } from 'vitest'
import { sampleRegistryCatalog } from '../../../test/fixtures/sampleRegistryCatalog'
import {
  isCatalogLoadAttemptResolved,
  shouldAwaitCatalogMembershipRecheck,
} from './runtimePackageCatalog'

describe('shouldAwaitCatalogMembershipRecheck', () => {
  it('holds not-found while a loaded catalog miss has not been force-rechecked', () => {
    expect(
      shouldAwaitCatalogMembershipRecheck({
        catalog: sampleRegistryCatalog,
        isLoading: false,
        hasCompletedForcedReload: false,
        isMember: false,
      }),
    ).toBe(true)
  })

  it('holds not-found while a catalog load is in flight', () => {
    expect(
      shouldAwaitCatalogMembershipRecheck({
        catalog: sampleRegistryCatalog,
        isLoading: true,
        hasCompletedForcedReload: false,
        isMember: false,
      }),
    ).toBe(true)
  })

  it('does not wait when the path is already in the catalog', () => {
    expect(
      shouldAwaitCatalogMembershipRecheck({
        catalog: sampleRegistryCatalog,
        isLoading: false,
        hasCompletedForcedReload: false,
        isMember: true,
      }),
    ).toBe(false)
  })

  it('does not wait after a forced reload or when the catalog failed to load', () => {
    expect(
      shouldAwaitCatalogMembershipRecheck({
        catalog: sampleRegistryCatalog,
        isLoading: false,
        hasCompletedForcedReload: true,
        isMember: false,
      }),
    ).toBe(false)
    expect(
      shouldAwaitCatalogMembershipRecheck({
        catalog: null,
        isLoading: false,
        hasCompletedForcedReload: false,
        isMember: false,
      }),
    ).toBe(false)
  })
})

describe('isCatalogLoadAttemptResolved', () => {
  it('treats a pending membership recheck as unresolved', () => {
    expect(isCatalogLoadAttemptResolved(false)).toBe(true)
    expect(
      isCatalogLoadAttemptResolved(false, {
        catalog: sampleRegistryCatalog,
        hasCompletedForcedReload: false,
        isMember: false,
      }),
    ).toBe(false)
    expect(
      isCatalogLoadAttemptResolved(false, {
        catalog: sampleRegistryCatalog,
        hasCompletedForcedReload: true,
        isMember: false,
      }),
    ).toBe(true)
  })
})
