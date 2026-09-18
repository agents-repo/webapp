export { siteName, siteName as ogSiteName } from '../accessibility/documentTitleFormat.ts'

import {
  findSiteRoutePath,
  siteRoutes,
  type SiteRoutePath,
} from '../../presentation/routes/siteRoutes.ts'

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

export function getOgImageUrl(origin: string = siteOrigin, canonicalPath?: string): string {
  const matchedRoute =
    canonicalPath && canonicalPath.length > 0 ? findSiteRoutePath(canonicalPath) : undefined
  const routePath = matchedRoute ? routeOgImagePathByCanonicalPath[matchedRoute] : undefined
  const publicPath = routePath ?? ogImagePath
  return `${origin}${publicPath}`
}

export function getOgImageAlt(canonicalPath?: string): string {
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
