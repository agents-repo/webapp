import { createHash } from 'node:crypto'

const DESCRIPTION_MAX_LENGTH = 160

/**
 * @param {string} value
 * @param {number} [maxLength]
 */
export function clampOgCardDescription(value, maxLength = DESCRIPTION_MAX_LENGTH) {
  const trimmed = value.trim()
  if (trimmed.length <= maxLength) {
    return trimmed
  }
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`
}

/**
 * Stable render inputs for one catalog package (used for cache keys and Satori).
 * @param {{ namespace: string, package: string, name: string, description: string, category?: string, status?: string }} pkg
 */
export function buildPackageOgRenderInputs(pkg) {
  return {
    namespace: pkg.namespace,
    packageId: pkg.package,
    name: pkg.name,
    description: clampOgCardDescription(pkg.description ?? ''),
    category: pkg.category ?? '',
    status: pkg.status ?? '',
  }
}

/**
 * @param {ReturnType<typeof buildPackageOgRenderInputs>} inputs
 */
export function hashPackageOgRenderInputs(inputs) {
  const hash = createHash('sha256')
  hash.update(JSON.stringify(inputs))
  return hash.digest('hex')
}

/**
 * @param {string} namespace
 * @param {string} packageId
 */
export function packageOgCacheKey(namespace, packageId) {
  return `${namespace}/${packageId}`
}

export function packageOgCacheFileBase(namespace, packageId) {
  return `${namespace}__${packageId}`
}

/**
 * Public URL path segment (must match `getPackageDetailOgImagePublicPath` in siteSeo.ts).
 * @param {string} namespace
 * @param {string} packageId
 */
export function getPackageDetailOgImagePublicPath(namespace, packageId) {
  return `/og/packages/${namespace}/${packageId}.jpg`
}
