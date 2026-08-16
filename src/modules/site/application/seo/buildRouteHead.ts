import { formatDocumentTitle } from '../accessibility/documentTitleFormat.ts'
import { getSitePageMeta } from '../accessibility/sitePageMeta.ts'
import { siteRoutes } from '../../presentation/routes/siteRoutes.ts'
import {
  getOgImageUrl,
  getSiteOrigin,
  ogImageAlt,
  ogImageHeight,
  ogImageWidth,
  ogLocale,
  ogSiteName,
  ogType,
  siteName,
  twitterCard,
  twitterSite,
} from './siteSeo.ts'
import { getOrganizationSameAsUrls } from '../community/socialLinks.ts'
import { getSiteSeoMeta } from './siteSeoMeta.ts'
import { parsePackageSitePath } from '../../../registry/application/packageSiteRoutes.ts'
import { getPackageCodeRepositoryUrl } from '../../../registry/application/packageSiteSeo.ts'
import {
  getRuntimeGithubRepositoryUrl,
  getRuntimePackageCatalog,
} from '../../../registry/application/runtimePackageCatalog.ts'
import { DEFAULT_REGISTRY_GITHUB_REPOSITORY_URL } from '../../../registry/infrastructure/registrySourceUrl.ts'
import type { RegistryCatalog } from '../../../registry/domain/package.ts'

const legacyGithubPagesHost = 'agents-repo.github.io'
const customSiteOrigin = 'https://agents-repo.org'

export function injectLegacyDomainRedirectIntoHtml(html: string): string {
  const script = [
    '<script>',
    `if (location.hostname === '${legacyGithubPagesHost}') {`,
    `  location.replace('${customSiteOrigin}' + location.pathname + location.search + location.hash);`,
    '}',
    '</script>',
  ].join('\n    ')

  return html.replace(/<head([^>]*)>/i, `<head$1>\n    ${script}`)
}

export interface RouteHeadData {
  readonly documentTitle: string
  readonly description: string
  readonly canonicalUrl: string
  readonly ogTitle: string
  readonly ogDescription: string
  readonly ogUrl: string
  readonly ogImage: string
  readonly ogImageWidth: number
  readonly ogImageHeight: number
  readonly ogImageAlt: string
  readonly ogType: string
  readonly ogSiteName: string
  readonly ogLocale: string
  readonly twitterCard: string
  readonly twitterSite: string
  readonly twitterTitle: string
  readonly twitterDescription: string
  readonly twitterImage: string
  readonly jsonLd: Record<string, unknown>
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function buildCanonicalUrl(origin: string, canonicalPath: string): string {
  if (canonicalPath === '/') {
    return `${origin}/`
  }

  return `${origin}${canonicalPath}`
}

function buildJsonLd(
  origin: string,
  canonicalPath: string,
  pageTitle: string,
  description: string,
  canonicalUrl: string,
  githubRepositoryUrl: string,
): Record<string, unknown> {
  const organizationId = `${origin}/#organization`
  const websiteId = `${origin}/#website`

  if (canonicalPath === siteRoutes.home) {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': organizationId,
          name: siteName,
          url: `${origin}/`,
          sameAs: getOrganizationSameAsUrls(),
        },
        {
          '@type': 'WebSite',
          '@id': websiteId,
          name: siteName,
          url: `${origin}/`,
          publisher: { '@id': organizationId },
        },
      ],
    }
  }

  const packageRoute = parsePackageSitePath(canonicalPath)
  if (packageRoute?.kind === 'index' || packageRoute?.kind === 'namespace') {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: formatDocumentTitle(pageTitle),
      description,
      url: canonicalUrl,
    }
  }

  if (packageRoute?.kind === 'detail') {
    const codeRepository = getPackageCodeRepositoryUrl(
      githubRepositoryUrl,
      packageRoute.namespace,
      packageRoute.packageId,
    )
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      name: formatDocumentTitle(pageTitle),
      description,
      url: canonicalUrl,
      ...(codeRepository ? { codeRepository } : {}),
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: formatDocumentTitle(pageTitle),
    description,
    url: canonicalUrl,
  }
}

export interface RouteHeadOptions {
  readonly catalog?: RegistryCatalog | null
  readonly githubRepositoryUrl?: string
}

export function getRouteHeadData(
  pathname: string,
  siteOriginOverride?: string,
  options: RouteHeadOptions = {},
): RouteHeadData {
  const origin = getSiteOrigin(siteOriginOverride)
  const catalog = options.catalog ?? getRuntimePackageCatalog()
  const githubRepositoryUrl =
    options.githubRepositoryUrl || getRuntimeGithubRepositoryUrl() || DEFAULT_REGISTRY_GITHUB_REPOSITORY_URL
  const pageMeta = getSitePageMeta(pathname, catalog)
  const seoMeta = getSiteSeoMeta(pathname, catalog)
  const documentTitle = formatDocumentTitle(pageMeta.title)
  const canonicalUrl = buildCanonicalUrl(origin, seoMeta.canonicalPath)
  const ogImage = getOgImageUrl(origin)

  return {
    documentTitle,
    description: seoMeta.description,
    canonicalUrl,
    ogTitle: documentTitle,
    ogDescription: seoMeta.description,
    ogUrl: canonicalUrl,
    ogImage,
    ogImageWidth,
    ogImageHeight,
    ogImageAlt,
    ogType,
    ogSiteName,
    ogLocale,
    twitterCard,
    twitterSite,
    twitterTitle: documentTitle,
    twitterDescription: seoMeta.description,
    twitterImage: ogImage,
    jsonLd: buildJsonLd(
      origin,
      seoMeta.canonicalPath,
      pageMeta.title,
      seoMeta.description,
      canonicalUrl,
      githubRepositoryUrl,
    ),
  }
}

export function renderRouteHeadHtml(data: RouteHeadData): string {
  const jsonLd = JSON.stringify(data.jsonLd).replaceAll('<', String.raw`\u003c`)

  return [
    `<title>${escapeHtml(data.documentTitle)}</title>`,
    `<meta name="description" content="${escapeHtml(data.description)}" />`,
    `<meta name="robots" content="index, follow" />`,
    `<link rel="canonical" href="${escapeHtml(data.canonicalUrl)}" />`,
    `<meta property="og:url" content="${escapeHtml(data.ogUrl)}" />`,
    `<meta property="og:title" content="${escapeHtml(data.ogTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(data.ogDescription)}" />`,
    `<meta property="og:image" content="${escapeHtml(data.ogImage)}" />`,
    `<meta property="og:image:width" content="${data.ogImageWidth}" />`,
    `<meta property="og:image:height" content="${data.ogImageHeight}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(data.ogImageAlt)}" />`,
    `<meta property="og:type" content="${escapeHtml(data.ogType)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(data.ogSiteName)}" />`,
    `<meta property="og:locale" content="${escapeHtml(data.ogLocale)}" />`,
    `<meta name="twitter:card" content="${escapeHtml(data.twitterCard)}" />`,
    `<meta name="twitter:site" content="${escapeHtml(data.twitterSite)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(data.twitterTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(data.twitterDescription)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(data.twitterImage)}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join('\n    ')
}

export function buildRouteHead(pathname: string, siteOriginOverride?: string): string {
  return renderRouteHeadHtml(getRouteHeadData(pathname, siteOriginOverride))
}

export function injectRouteHeadIntoHtml(
  html: string,
  pathname: string,
  siteOriginOverride?: string,
): string {
  const headFragment = buildRouteHead(pathname, siteOriginOverride)
  return injectHeadFragmentIntoHtml(html, headFragment)
}

export function renderSpaFallbackHeadHtml(): string {
  return [
    `<title>${escapeHtml(formatDocumentTitle('Page not found'))}</title>`,
    `<meta name="robots" content="noindex, nofollow" />`,
  ].join('\n    ')
}

export function injectSpaFallbackHeadIntoHtml(html: string): string {
  return injectHeadFragmentIntoHtml(html, renderSpaFallbackHeadHtml())
}

function injectHeadFragmentIntoHtml(html: string, headFragment: string): string {
  const withoutTitle = html.replace(/<title>[^<]*<\/title>\s*/i, '')
  const withoutDescription = withoutTitle.replace(/<meta\s+name="description"[\s\S]*?\/>\s*/i, '')

  return withoutDescription.replace('</head>', `    ${headFragment}\n  </head>`)
}
