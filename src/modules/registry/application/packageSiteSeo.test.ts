import { describe, expect, it } from 'vitest'
import { sampleRegistryCatalog } from '../../../test/fixtures/sampleRegistryCatalog'
import { clampSeoDescription, getPackageSiteSeoDescription } from './packageSiteSeo'

describe('packageSiteSeo', () => {
  it('clamps descriptions to 160 characters', () => {
    const long = 'a'.repeat(200)
    expect(clampSeoDescription(long)).toHaveLength(160)
  })

  it('uses the package description for detail routes', () => {
    expect(
      getPackageSiteSeoDescription(
        { kind: 'detail', namespace: 'agents-repo', packageId: 'sample-agent' },
        sampleRegistryCatalog,
      ),
    ).toBe(sampleRegistryCatalog.packages[0].description)
  })
})
