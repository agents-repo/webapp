import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { searchableCatalog } from '../e2e/fixtures/catalog.ts'
import { generatePackageOgDist } from '../scripts/generate-package-og-dist.mjs'
import { getPackageDetailOgImagePublicPath } from '../scripts/og/package-og-inputs.mjs'

test('generatePackageOgDist writes dist JPEGs and uses incremental cache', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'package-og-dist-'))
  const distDir = path.join(tempRoot, 'dist')
  const cacheDir = path.join(tempRoot, 'cache')
  await fs.mkdir(distDir, { recursive: true })

  const catalog = {
    ...searchableCatalog,
    packages: searchableCatalog.packages.slice(0, 2),
  }

  await generatePackageOgDist(catalog, distDir, { cacheDir, concurrency: 2 })

  for (const pkg of catalog.packages) {
    const relative = getPackageDetailOgImagePublicPath(pkg.namespace, pkg.package).slice(1)
    const filePath = path.join(distDir, relative)
    const stat = await fs.stat(filePath)
    assert.ok(stat.size > 0)
  }

  await generatePackageOgDist(catalog, distDir, { cacheDir, concurrency: 2 })
})

test('generatePackageOgDist does not wipe cacheDir on cold template digest', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'package-og-dist-'))
  const distDir = path.join(tempRoot, 'dist')
  const cacheDir = path.join(tempRoot, 'cache')
  await fs.mkdir(distDir, { recursive: true })
  await fs.mkdir(cacheDir, { recursive: true })
  const sentinelPath = path.join(cacheDir, 'sentinel.txt')
  await fs.writeFile(sentinelPath, 'keep\n', 'utf8')

  const catalog = {
    ...searchableCatalog,
    packages: searchableCatalog.packages.slice(0, 1),
  }

  await generatePackageOgDist(catalog, distDir, { cacheDir })

  const sentinel = await fs.readFile(sentinelPath, 'utf8')
  assert.equal(sentinel, 'keep\n')
})

test('generatePackageOgDist re-renders when package description changes', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'package-og-dist-'))
  const distDir = path.join(tempRoot, 'dist')
  const cacheDir = path.join(tempRoot, 'cache')
  await fs.mkdir(distDir, { recursive: true })

  const basePkg = searchableCatalog.packages[0]
  const catalog = {
    ...searchableCatalog,
    packages: [basePkg],
  }

  await generatePackageOgDist(catalog, distDir, { cacheDir })
  const firstPath = path.join(
    distDir,
    getPackageDetailOgImagePublicPath(basePkg.namespace, basePkg.package).slice(1),
  )
  const firstBytes = await fs.readFile(firstPath)

  const updatedCatalog = {
    ...catalog,
    packages: [{ ...basePkg, description: `${basePkg.description} updated for cache test` }],
  }
  await generatePackageOgDist(updatedCatalog, distDir, { cacheDir })
  const secondBytes = await fs.readFile(firstPath)

  assert.notEqual(firstBytes.compare(secondBytes), 0)
})
