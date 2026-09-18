#!/usr/bin/env node
/**
 * Batch-generate package catalog OG JPEGs into dist/ during prepare-pages-dist.
 * Uses gitignored incremental cache under scripts/.generated/og-packages-cache/.
 */
/* eslint-disable security/detect-non-literal-fs-filename -- paths validated against catalog slugs */
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import {
  brandLogoSvgRelativePath,
  MAX_JPEG_BYTES,
  OG_HEIGHT,
  OG_WIDTH,
} from './og/constants.mjs'
import { PACKAGE_CATALOG_OG_TEMPLATE_BASENAMES } from './og/package-og-catalog.mjs'
import {
  buildPackageOgRenderInputs,
  getPackageDetailOgImagePublicPath,
  hashPackageOgRenderInputs,
  packageOgCacheFileBase,
  packageOgCacheKey,
} from './og/package-og-inputs.mjs'
import { renderPackageDetailOgJpeg } from './og/render-package-og.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ogDir = path.join(repoRoot, 'scripts', 'og')
const defaultCacheDir = path.join(repoRoot, 'scripts', '.generated', 'og-packages-cache')

const DEFAULT_CONCURRENCY = 6

async function hashTemplateSources() {
  const hash = createHash('sha256')
  for (const name of [...PACKAGE_CATALOG_OG_TEMPLATE_BASENAMES].sort((a, b) => a.localeCompare(b))) {
    const file = path.join(ogDir, name)
    const body = await fs.readFile(file)
    hash.update(name)
    hash.update('\n')
    hash.update(body)
    hash.update('\n')
  }
  const logoPath = path.join(repoRoot, brandLogoSvgRelativePath)
  const logoBody = await fs.readFile(logoPath)
  hash.update(path.basename(logoPath))
  hash.update('\n')
  hash.update(logoBody)
  hash.update('\n')
  return hash.digest('hex')
}

async function assertJpegConstraints(buffer, label) {
  const meta = await sharp(buffer).metadata()
  if (meta.width !== OG_WIDTH || meta.height !== OG_HEIGHT) {
    throw new Error(
      `${label} dimensions ${meta.width ?? '?'}x${meta.height ?? '?'} (expected ${OG_WIDTH}x${OG_HEIGHT})`,
    )
  }
  if (buffer.length > MAX_JPEG_BYTES) {
    throw new Error(`${label} is ${buffer.length} bytes (max ${MAX_JPEG_BYTES})`)
  }
}

function assertPackageSlug(value, label) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new Error(`Invalid ${label} for OG output path: ${value}`)
  }
}

/**
 * @param {import('../src/modules/registry/domain/package.ts').RegistryCatalog} catalog
 * @param {string} distDir
 * @param {{ cacheDir?: string, concurrency?: number }} [options]
 */
export async function generatePackageOgDist(catalog, distDir, options = {}) {
  const cacheDir = options.cacheDir ?? defaultCacheDir
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY
  const started = performance.now()

  const templateDigest = await hashTemplateSources()
  const templateMarker = path.join(cacheDir, '.template-digest')
  let previousDigest = ''
  try {
    previousDigest = (await fs.readFile(templateMarker, 'utf8')).trim()
  } catch {
    // cold cache
  }
  if (previousDigest !== templateDigest) {
    await fs.rm(cacheDir, { recursive: true, force: true })
  }
  await fs.mkdir(cacheDir, { recursive: true })
  await fs.writeFile(templateMarker, `${templateDigest}\n`, 'utf8')

  const packages = [...catalog.packages].sort((left, right) => {
    const leftKey = packageOgCacheKey(left.namespace, left.package)
    const rightKey = packageOgCacheKey(right.namespace, right.package)
    return leftKey.localeCompare(rightKey)
  })

  const distOgRoot = path.join(distDir, 'og', 'packages')
  await fs.mkdir(distOgRoot, { recursive: true })

  const expectedKeys = new Set()
  let rendered = 0
  let cached = 0

  async function processPackage(pkg) {
    assertPackageSlug(pkg.namespace, 'namespace')
    assertPackageSlug(pkg.package, 'packageId')
    const key = packageOgCacheKey(pkg.namespace, pkg.package)
    expectedKeys.add(key)

    const inputs = buildPackageOgRenderInputs(pkg)
    const inputHash = hashPackageOgRenderInputs(inputs)
    const cacheBase = packageOgCacheFileBase(pkg.namespace, pkg.package)
    const cacheJpeg = path.join(cacheDir, `${cacheBase}.jpg`)
    const cacheHashPath = path.join(cacheDir, `${cacheBase}.input-hash`)
    const distJpeg = path.join(distOgRoot, pkg.namespace, `${pkg.package}.jpg`)

    await fs.mkdir(path.dirname(distJpeg), { recursive: true })

    let jpeg
    try {
      const [storedHash, storedJpeg] = await Promise.all([
        fs.readFile(cacheHashPath, 'utf8'),
        fs.readFile(cacheJpeg),
      ])
      if (storedHash.trim() === inputHash) {
        jpeg = storedJpeg
      }
    } catch {
      // miss
    }

    if (!jpeg) {
      jpeg = await renderPackageDetailOgJpeg(pkg)
      await assertJpegConstraints(jpeg, getPackageDetailOgImagePublicPath(pkg.namespace, pkg.package))
      await fs.writeFile(cacheJpeg, jpeg)
      await fs.writeFile(cacheHashPath, `${inputHash}\n`, 'utf8')
      rendered += 1
    } else {
      cached += 1
    }

    await fs.writeFile(distJpeg, jpeg)
  }

  let nextIndex = 0
  const workerCount = Math.min(concurrency, Math.max(1, packages.length))
  const workers = []
  for (let w = 0; w < workerCount; w += 1) {
    workers.push(
      (async () => {
        while (true) {
          const currentIndex = nextIndex
          nextIndex += 1
          if (currentIndex >= packages.length) {
            break
          }
          await processPackage(packages[currentIndex])
        }
      })(),
    )
  }
  await Promise.all(workers)

  const cacheEntries = await fs.readdir(cacheDir, { withFileTypes: true })
  for (const entry of cacheEntries) {
    if (!entry.isFile() || !entry.name.endsWith('.jpg')) {
      continue
    }
    const cacheBase = entry.name.slice(0, -4)
    const key = cacheBase.replace('__', '/')
    if (!expectedKeys.has(key)) {
      await fs.unlink(path.join(cacheDir, entry.name))
      const hashFile = path.join(cacheDir, `${cacheBase}.input-hash`)
      await fs.unlink(hashFile).catch(() => {})
    }
  }

  const elapsedMs = Math.round(performance.now() - started)
  console.log(
    `package OG: rendered ${rendered}, cached ${cached}, total ${packages.length} (${elapsedMs}ms)`,
  )
}

export { hashTemplateSources as hashPackageCatalogOgTemplateSources }
