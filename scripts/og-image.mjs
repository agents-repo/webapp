#!/usr/bin/env node
/**
 * Generate and drift-check committed Open Graph JPEGs (site default + route-specific).
 *
 * Usage:
 *   node scripts/og-image.mjs generate
 *   node scripts/og-image.mjs check
 *
 * Does not run during `npm run build:pages`. Commit JPEGs and fingerprint files after
 * template changes.
 */
/* eslint-disable security/detect-non-literal-fs-filename -- paths are repo-relative */
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
import { ROUTE_OG_ARTIFACTS, ROUTE_OG_TEMPLATE_BASENAMES } from './og/routes.mjs'
import { renderAllRouteOgJpegs } from './og/render-route-og.mjs'
import { renderSiteDefaultOgJpeg } from './og/render-site-default.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ogDir = path.join(root, 'scripts', 'og')
const routeOgDir = path.join(root, 'public', 'og')
const jpegPath = path.join(root, 'public', 'og-image.jpg')
const fingerprintPath = path.join(root, 'public', 'og-image.src.sha256')
const routeFingerprintPath = path.join(routeOgDir, 'routes.src.sha256')

const SITE_DEFAULT_TEMPLATE_BASENAMES = [
  'constants.mjs',
  'render-lib.mjs',
  'site-default-card.mjs',
  'render-site-default.mjs',
]

const command = process.argv[2]

if (!['generate', 'check'].includes(command)) {
  console.error('Usage: node scripts/og-image.mjs <generate|check>')
  process.exit(2)
}

async function hashFiles(basenames) {
  const hash = createHash('sha256')
  for (const name of [...basenames].sort()) {
    const file = path.join(ogDir, name)
    const body = await fs.readFile(file)
    hash.update(name)
    hash.update('\n')
    hash.update(body)
    hash.update('\n')
  }
  const logoPath = path.join(root, brandLogoSvgRelativePath)
  const logoBody = await fs.readFile(logoPath)
  hash.update(path.basename(logoPath))
  hash.update('\n')
  hash.update(logoBody)
  hash.update('\n')
  return hash.digest('hex')
}

function hashBuffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

async function assertJpegConstraints(buffer, label, failures) {
  const meta = await sharp(buffer).metadata()
  if (meta.width !== OG_WIDTH || meta.height !== OG_HEIGHT) {
    failures.push(
      `${label} dimensions ${meta.width ?? '?'}x${meta.height ?? '?'} (expected ${OG_WIDTH}x${OG_HEIGHT})`,
    )
  }
  if (buffer.length > MAX_JPEG_BYTES) {
    failures.push(
      `${label} is ${buffer.length} bytes (max ${MAX_JPEG_BYTES}); lower JPEG_QUALITY or simplify the template`,
    )
  }
}

function checkSourceFingerprint(label, committedDigest, expectedDigest, failures) {
  if (!committedDigest) {
    return
  }
  if (committedDigest !== expectedDigest) {
    failures.push(
      `${label} fingerprint drift: run npm run og:generate and commit updated JPEG(s) and .sha256 files`,
    )
  }
}

async function checkCommittedJpeg(label, filePath, render, failures) {
  let committedJpeg
  try {
    committedJpeg = await fs.readFile(filePath)
  } catch {
    failures.push(`missing ${path.relative(root, filePath)}; run npm run og:generate`)
    return
  }

  await assertJpegConstraints(committedJpeg, label, failures)
  try {
    const rendered = await render()
    if (hashBuffer(rendered) !== hashBuffer(committedJpeg)) {
      failures.push(`${label} does not match the current template; run npm run og:generate`)
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    failures.push(`OG render failed during check (${label}): ${detail}`)
  }
}

async function generate() {
  const siteJpeg = await renderSiteDefaultOgJpeg()
  const failures = []
  await assertJpegConstraints(siteJpeg, 'og-image.jpg', failures)
  if (failures.length > 0) {
    throw new Error(failures.join('\n').trim() || 'OG image generation failed validation')
  }

  const siteDigest = await hashFiles(SITE_DEFAULT_TEMPLATE_BASENAMES)
  await fs.writeFile(jpegPath, siteJpeg)
  await fs.writeFile(fingerprintPath, `${siteDigest}\n`, 'utf8')
  console.log(`Wrote ${path.relative(root, jpegPath)} (${siteJpeg.length} bytes)`)
  console.log(`Wrote ${path.relative(root, fingerprintPath)}`)

  await fs.mkdir(routeOgDir, { recursive: true })
  const routeJpegs = await renderAllRouteOgJpegs()
  for (const { id, jpegFile } of ROUTE_OG_ARTIFACTS) {
    const buffer = routeJpegs[id]
    await assertJpegConstraints(buffer, jpegFile, failures)
  }
  if (failures.length > 0) {
    throw new Error(failures.join('\n').trim() || 'Route OG generation failed validation')
  }

  for (const { id, jpegFile } of ROUTE_OG_ARTIFACTS) {
    const outPath = path.join(routeOgDir, jpegFile)
    const buffer = routeJpegs[id]
    await fs.writeFile(outPath, buffer)
    console.log(`Wrote ${path.relative(root, outPath)} (${buffer.length} bytes)`)
  }

  const routeDigest = await hashFiles(ROUTE_OG_TEMPLATE_BASENAMES)
  await fs.writeFile(routeFingerprintPath, `${routeDigest}\n`, 'utf8')
  console.log(`Wrote ${path.relative(root, routeFingerprintPath)}`)
}

async function check() {
  const failures = []
  const expectedSiteDigest = (await hashFiles(SITE_DEFAULT_TEMPLATE_BASENAMES)).trim()
  let committedSiteDigest = ''
  try {
    committedSiteDigest = (await fs.readFile(fingerprintPath, 'utf8')).trim()
  } catch {
    failures.push(`missing ${path.relative(root, fingerprintPath)}; run npm run og:generate`)
  }

  checkSourceFingerprint('Site default template', committedSiteDigest, expectedSiteDigest, failures)
  await checkCommittedJpeg('og-image.jpg', jpegPath, renderSiteDefaultOgJpeg, failures)

  const expectedRouteDigest = (await hashFiles(ROUTE_OG_TEMPLATE_BASENAMES)).trim()
  let committedRouteDigest = ''
  try {
    committedRouteDigest = (await fs.readFile(routeFingerprintPath, 'utf8')).trim()
  } catch {
    failures.push(`missing ${path.relative(root, routeFingerprintPath)}; run npm run og:generate`)
  }

  checkSourceFingerprint('Route OG template', committedRouteDigest, expectedRouteDigest, failures)

  const { renderRouteOgJpeg } = await import('./og/render-route-og.mjs')
  for (const { id, jpegFile } of ROUTE_OG_ARTIFACTS) {
    const filePath = path.join(routeOgDir, jpegFile)
    await checkCommittedJpeg(jpegFile, filePath, () => renderRouteOgJpeg(id), failures)
  }

  if (failures.length > 0) {
    console.error(failures.join('\n'))
    process.exit(1)
  }
  console.log('og:check passed (site default + route OG JPEGs)')
}

try {
  if (command === 'generate') {
    await generate()
  } else {
    await check()
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
