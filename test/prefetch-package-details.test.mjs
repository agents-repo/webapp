import assert from 'node:assert/strict'
import { mkdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { afterEach, describe, it } from 'node:test'
import { searchableCatalog } from '../e2e/fixtures/catalog.ts'
import { loadPackageDetailsForBuild } from '../scripts/prefetch-package-details-lib.mjs'
import { GENERATED_PACKAGE_SITE_CATALOG_PATH } from '../scripts/package-site-routes-path.ts'

const snapshotCatalog = {
  schemaVersion: '1.3.0',
  updatedAt: '2026-06-08T02:09:56.645Z',
  packages: [
    {
      id: 'agents-repo/hello-agent',
      namespace: 'agents-repo',
      package: 'hello-agent',
      name: 'hello-agent',
      description: 'Hello Agent package',
      owner: 'agents-repo',
      latest: '1.0.0',
      tags: ['agent'],
      status: 'active',
      category: 'assistant',
      estimateOverallCost: { band: 'low' },
    },
  ],
}

describe('prefetch package details', () => {
  afterEach(() => {
    try {
      unlinkSync(GENERATED_PACKAGE_SITE_CATALOG_PATH)
    } catch {
      // Best-effort cleanup when another test already removed the artifact.
    }
  })

  it('reuses the generated catalog snapshot when available', async () => {
    mkdirSync(dirname(GENERATED_PACKAGE_SITE_CATALOG_PATH), { recursive: true })
    writeFileSync(
      GENERATED_PACKAGE_SITE_CATALOG_PATH,
      `${JSON.stringify(snapshotCatalog, null, 2)}\n`,
    )

    const details = await loadPackageDetailsForBuild('e2e')
    const detailKeys = Object.keys(details).sort()

    assert.deepEqual(detailKeys, ['agents-repo/hello-agent'])
    assert.notEqual(detailKeys.length, searchableCatalog.packages.length)
    assert.equal(details['agents-repo/hello-agent'].metadata.name, 'hello-agent')
    assert.equal(details['agents-repo/hello-agent'].package, 'agents-repo/hello-agent')
  })

  it('generates distinct E2E details per catalog entry', async () => {
    const details = await loadPackageDetailsForBuild('e2e')

    for (const pkg of searchableCatalog.packages) {
      const key = `${pkg.namespace}/${pkg.package}`
      const detail = details[key]

      assert.ok(detail, `missing detail for ${key}`)
      assert.equal(detail.package, key)
      assert.equal(detail.version, pkg.latest)
      assert.equal(detail.metadata.name, pkg.name)
      assert.equal(detail.metadata.description, pkg.description)
    }
  })
})
