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
} from './siteSeo.ts'
import { getSiteSeoMeta } from './siteSeoMeta.ts'

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

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: formatDocumentTitle(pageTitle),
    description,
    url: canonicalUrl,
  }
}

export function getRouteHeadData(pathname: string, siteOriginOverride?: string): RouteHeadData {
  const origin = getSiteOrigin(siteOriginOverride)
  const pageMeta = getSitePageMeta(pathname)
  const seoMeta = getSiteSeoMeta(pathname)
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
    twitterTitle: documentTitle,
    twitterDescription: seoMeta.description,
    twitterImage: ogImage,
    jsonLd: buildJsonLd(origin, seoMeta.canonicalPath, pageMeta.title, seoMeta.description, canonicalUrl),
  }
}

export function renderRouteHeadHtml(data: RouteHeadData): string {
  const jsonLd = JSON.stringify(data.jsonLd).replaceAll('<', '\\u003c')

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
