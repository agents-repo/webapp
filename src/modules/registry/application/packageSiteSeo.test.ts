import { describe, expect, it } from 'vitest'
import { sampleRegistryCatalog } from '../../../test/fixtures/sampleRegistryCatalog'
import {
  clampSeoDescription,
  getPackageDetailShareSeoDescription,
  getPackageSiteSeoDescription,
} from './packageSiteSeo'
import type { RegistryPackage } from '../domain/package'

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

  it('includes the CLI install command in package detail share descriptions', () => {
    const pkg = sampleRegistryCatalog.packages[0]
    const shareDescription = getPackageDetailShareSeoDescription(pkg)

    expect(shareDescription).toContain('npx agents-repo install agents-repo/sample-agent')
    expect(shareDescription.length).toBeLessThanOrEqual(160)
    expect(shareDescription).toContain(pkg.description)
  })

  it('keeps the install command when the package description is long', () => {
    const pkg: RegistryPackage = {
      ...sampleRegistryCatalog.packages[0],
      description: 'a'.repeat(200),
    }
    const shareDescription = getPackageDetailShareSeoDescription(pkg)

    expect(shareDescription).toContain('npx agents-repo install agents-repo/sample-agent')
    expect(shareDescription).toHaveLength(160)
  })

  it('falls back to description-only share text when the registry ref is invalid', () => {
    const pkg: RegistryPackage = {
      ...sampleRegistryCatalog.packages[0],
      namespace: 'evil;rm',
    }

    expect(getPackageDetailShareSeoDescription(pkg)).toBe(getPackageSiteSeoDescription(
      { kind: 'detail', namespace: pkg.namespace, packageId: pkg.package },
      { ...sampleRegistryCatalog, packages: [pkg] },
    ))
  })
})
