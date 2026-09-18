export { siteName, siteName as ogSiteName } from '../accessibility/documentTitleFormat.ts'

import {
  findSiteRoutePath,
  siteRoutes,
  type SiteRoutePath,
} from '../../presentation/routes/siteRoutes.ts'
import {
  findRegistryPackage,
  parsePackageSitePath,
} from '../../../registry/application/packageSiteRoutes.ts'
import type { RegistryCatalog } from '../../../registry/domain/package.ts'
import { formatRegistryPackageRef } from '../../../registry/domain/package.ts'

const defaultSiteOrigin = 'https://agents-repo.org'

interface SiteImportMetaEnv {
  readonly VITE_SITE_URL?: string
}

export function getSiteOrigin(override?: string): string {
  const env = import.meta.env as SiteImportMetaEnv | undefined
  const fromEnv = override ?? env?.VITE_SITE_URL?.trim()
  return fromEnv && fromEnv.length > 0 ? fromEnv.replace(/\/$/, '') : defaultSiteOrigin
}

export const siteOrigin = getSiteOrigin()

export const ogImagePath = '/og-image.jpg'

/** Build-time package catalog OG JPEGs (phase 3). Must match `getPackageDetailOgImagePublicPath` in scripts/og/package-og-inputs.mjs. */
export function getPackageDetailOgImagePublicPath(namespace: string, packageId: string): string {
  return `/og/packages/${namespace}/${packageId}.jpg`
}

export interface OgImageResolutionOptions {
  readonly catalog?: RegistryCatalog | null
}

function resolvePackageDetailOgImagePath(
  canonicalPath: string,
  catalog: RegistryCatalog | null | undefined,
): string | undefined {
  const packageRoute = parsePackageSitePath(canonicalPath)
  if (packageRoute?.kind !== 'detail' || !catalog) {
    return undefined
  }
  const pkg = findRegistryPackage(catalog, packageRoute.namespace, packageRoute.packageId)
  if (!pkg) {
    return undefined
  }
  return getPackageDetailOgImagePublicPath(packageRoute.namespace, packageRoute.packageId)
}

/** Committed route-specific OG JPEGs (phase 2). Keys are canonical paths from `siteRoutes`. */
export const routeOgImagePathByCanonicalPath: Readonly<Partial<Record<SiteRoutePath, string>>> = {
  [siteRoutes.home]: '/og/home.jpg',
  [siteRoutes.packages]: '/og/packages.jpg',
  [siteRoutes.docs]: '/og/docs.jpg',
}

export const routeOgImageAltByCanonicalPath: Readonly<Partial<Record<SiteRoutePath, string>>> = {
  [siteRoutes.home]:
    'Agents Repo home — discover agents and flows in the open registry and install with the CLI for Copilot, Cursor, Claude Code, and Codex.',
  [siteRoutes.packages]:
    'Agents Repo packages — browse published agents and flows for Copilot, Cursor, Claude Code, and Codex.',
  [siteRoutes.docs]:
    'Agents Repo docs — catalog browsing, CLI install, contributing, and markdown downloads for AI agents.',
}

export function getOgImageUrl(
  origin: string = siteOrigin,
  canonicalPath?: string,
  options: OgImageResolutionOptions = {},
): string {
  const packageDetailPath = canonicalPath
    ? resolvePackageDetailOgImagePath(canonicalPath, options.catalog)
    : undefined
  if (packageDetailPath) {
    return `${origin}${packageDetailPath}`
  }

  const matchedRoute =
    canonicalPath && canonicalPath.length > 0 ? findSiteRoutePath(canonicalPath) : undefined
  const routePath = matchedRoute ? routeOgImagePathByCanonicalPath[matchedRoute] : undefined
  const publicPath = routePath ?? ogImagePath
  return `${origin}${publicPath}`
}

export function getOgImageAlt(
  canonicalPath?: string,
  options: OgImageResolutionOptions = {},
): string {
  const packageRoute =
    canonicalPath && canonicalPath.length > 0 ? parsePackageSitePath(canonicalPath) : undefined
  if (packageRoute?.kind === 'detail' && options.catalog) {
    const pkg = findRegistryPackage(options.catalog, packageRoute.namespace, packageRoute.packageId)
    if (pkg) {
      const ref = formatRegistryPackageRef(pkg.namespace, pkg.package)
      const alt = ref ? `${pkg.name} (${ref}) — Agents Repo package` : `${pkg.name} — Agents Repo package`
      return alt.length <= 200 ? alt : `${alt.slice(0, 199).trimEnd()}…`
    }
  }

  const matchedRoute =
    canonicalPath && canonicalPath.length > 0 ? findSiteRoutePath(canonicalPath) : undefined
  if (matchedRoute) {
    const routeAlt = routeOgImageAltByCanonicalPath[matchedRoute]
    if (routeAlt) {
      return routeAlt
    }
  }
  return ogImageAlt
}

export const ogImageWidth = 1200

export const ogImageHeight = 630

export const ogImageAlt =
  'Agents Repo — open registry for agents and flows. Find maintained packages, install with the CLI for GitHub Copilot, Cursor, Claude Code, and OpenAI Codex.'

export const ogLocale = 'en_US'

export const ogType = 'website'

export const twitterCard = 'summary_large_image'

export { twitterSite } from '../community/socialLinks.ts'
