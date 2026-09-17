#!/usr/bin/env node
/**
 * Generate and drift-check the committed site default Open Graph JPEG.
 *
 * Usage:
 *   node scripts/og-image.mjs generate
 *   node scripts/og-image.mjs check
 *
 * Does not run during `npm run build:pages`. Commit `public/og-image.jpg` and
 * `public/og-image.src.sha256` after template changes.
 */
/* eslint-disable security/detect-non-literal-fs-filename -- paths are repo-relative */
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { MAX_JPEG_BYTES, OG_HEIGHT, OG_WIDTH } from './og/constants.mjs'
import { renderSiteDefaultOgJpeg } from './og/render-site-default.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ogDir = path.join(root, 'scripts', 'og')
const jpegPath = path.join(root, 'public', 'og-image.jpg')
const fingerprintPath = path.join(root, 'public', 'og-image.src.sha256')

const command = process.argv[2]

if (!['generate', 'check'].includes(command)) {
  console.error('Usage: node scripts/og-image.mjs <generate|check>')
  process.exit(2)
}

async function listTemplateSources() {
  const entries = await fs.readdir(ogDir)
  return entries
    .filter((name) => name.endsWith('.mjs'))
    .sort()
    .map((name) => path.join(ogDir, name))
}

async function fingerprintTemplateSources() {
  const files = await listTemplateSources()
  const hash = createHash('sha256')
  for (const file of files) {
    const body = await fs.readFile(file)
    hash.update(path.basename(file))
    hash.update('\n')
    hash.update(body)
    hash.update('\n')
  }
  return hash.digest('hex')
}

function hashBuffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

async function assertJpegConstraints(buffer, failures) {
  const meta = await sharp(buffer).metadata()
  if (meta.width !== OG_WIDTH || meta.height !== OG_HEIGHT) {
    failures.push(
      `og-image.jpg dimensions ${meta.width ?? '?'}x${meta.height ?? '?'} (expected ${OG_WIDTH}x${OG_HEIGHT})`,
    )
  }
  if (buffer.length > MAX_JPEG_BYTES) {
    failures.push(
      `og-image.jpg is ${buffer.length} bytes (max ${MAX_JPEG_BYTES}); lower JPEG_QUALITY or simplify the template`,
    )
  }
}

async function generate() {
  const jpeg = await renderSiteDefaultOgJpeg()
  const failures = []
  await assertJpegConstraints(jpeg, failures)
  if (failures.length > 0) {
    throw new Error(failures.join('\n'))
  }
  const digest = await fingerprintTemplateSources()
  await fs.writeFile(jpegPath, jpeg)
  await fs.writeFile(fingerprintPath, `${digest}\n`, 'utf8')
  console.log(`Wrote ${path.relative(root, jpegPath)} (${jpeg.length} bytes)`)
  console.log(`Wrote ${path.relative(root, fingerprintPath)}`)
}

async function checkSourceFingerprint(committedDigest, expectedDigest, failures) {
  if (!committedDigest) {
    return
  }
  if (committedDigest !== expectedDigest) {
    failures.push(
      'OG template fingerprint drift: run npm run og:generate and commit public/og-image.jpg + public/og-image.src.sha256',
    )
  }
}

async function checkCommittedJpeg(failures) {
  let committedJpeg
  try {
    committedJpeg = await fs.readFile(jpegPath)
  } catch {
    failures.push(`missing ${path.relative(root, jpegPath)}; run npm run og:generate`)
    return
  }

  await assertJpegConstraints(committedJpeg, failures)
  try {
    const rendered = await renderSiteDefaultOgJpeg()
    if (hashBuffer(rendered) !== hashBuffer(committedJpeg)) {
      failures.push(
        'public/og-image.jpg does not match the current template; run npm run og:generate',
      )
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    failures.push(`OG render failed during check: ${detail}`)
  }
}

async function check() {
  const failures = []
  const expectedDigest = (await fingerprintTemplateSources()).trim()
  let committedDigest = ''
  try {
    committedDigest = (await fs.readFile(fingerprintPath, 'utf8')).trim()
  } catch {
    failures.push(`missing ${path.relative(root, fingerprintPath)}; run npm run og:generate`)
  }

  checkSourceFingerprint(committedDigest, expectedDigest, failures)
  await checkCommittedJpeg(failures)

  if (failures.length > 0) {
    console.error(failures.join('\n'))
    process.exit(1)
  }
  console.log('og:check passed (site default JPEG)')
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
