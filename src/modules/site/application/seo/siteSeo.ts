export { siteName, siteName as ogSiteName } from '../accessibility/documentTitleFormat.ts'

const defaultSiteOrigin = 'https://agents-repo.org'

interface SiteImportMetaEnv {
  readonly VITE_SITE_URL?: string
}

export function getSiteOrigin(override?: string): string {
  const env =
    typeof import.meta.env === 'undefined' ? ({} as SiteImportMetaEnv) : (import.meta.env as SiteImportMetaEnv)
  const fromEnv = override ?? env.VITE_SITE_URL?.trim()
  return fromEnv && fromEnv.length > 0 ? fromEnv.replace(/\/$/, '') : defaultSiteOrigin
}

export const siteOrigin = getSiteOrigin()

export const ogImagePath = '/og-image.jpg'

export function getOgImageUrl(origin: string = siteOrigin): string {
  return `${origin}${ogImagePath}`
}

export const ogImageWidth = 1200

export const ogImageHeight = 630

export const ogImageAlt =
  'Agents Repo — browse agents and flows for GitHub Copilot, Cursor, Claude Code, and OpenAI Codex.'

export const ogLocale = 'en_US'

export const ogType = 'website'

export const twitterCard = 'summary_large_image'
