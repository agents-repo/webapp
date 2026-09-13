import { formatDocumentTitle } from '../accessibility/documentTitleFormat.ts'
import { getSitePageMeta } from '../accessibility/sitePageMeta.ts'
import { parseLocaleFromPathname } from '../i18n/localePath.ts'
import { publicSitePath } from '../routes/sitePath.ts'
import { siteRoutes } from '../../presentation/routes/siteRoutes.ts'
import { parsePackageSitePath } from '../../../registry/application/packageSiteRoutes.ts'
import { getPackageSiteMarkdownPublicPath } from '../../../registry/application/packageSiteMarkdown.ts'
import type { PackageDetailDocument } from '../../../registry/domain/packageDetail.ts'
import { getRouteHeadData, type RouteHeadOptions } from './buildRouteHead.ts'
import { getSiteOrigin, siteName } from './siteSeo.ts'

const STATIC_ROUTE_FALLBACK_ID = 'static-route-fallback'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function renderFallbackLink(origin: string, path: string, label: string): string {
  const href = `${origin}${publicSitePath(path)}`
  return `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`
}

function renderHomeFallback(origin: string, description: string): string {
  const heading = siteName
  const links = [
    renderFallbackLink(origin, siteRoutes.packages, 'Browse packages'),
    renderFallbackLink(origin, '/llms.txt', 'llms.txt (docs index for agents)'),
    renderFallbackLink(origin, '/docs/for-ai-agents.md', 'For AI agents (.md)'),
  ].join('\n      ')

  return [
    `<noscript id="${STATIC_ROUTE_FALLBACK_ID}">`,
    '  <main>',
    `    <h1>${escapeHtml(heading)}</h1>`,
    `    <p>${escapeHtml(description)}</p>`,
    '    <ul>',
    `      ${links}`,
    '    </ul>',
    '  </main>',
    '</noscript>',
  ].join('\n')
}

function renderPackageDetailFallback(
  origin: string,
  pageTitle: string,
  description: string,
  namespace: string,
  packageId: string,
  detail?: PackageDetailDocument,
): string {
  const markdownPath = getPackageSiteMarkdownPublicPath(namespace, packageId)
  const markdownUrl = `${origin}${markdownPath}`
  const htmlPath = publicSitePath(`/packages/${namespace}/${packageId}`)
  const htmlUrl = `${origin}${htmlPath}`

  const agentLines =
    detail?.agents.map((agent) => `- ${agent.name}: ${agent.description}`).join('\n') ?? ''
  const flowLines =
    detail?.flows.map((flow) => `- ${flow.name}: ${flow.description}`).join('\n') ?? ''

  const sections = [
    `<h1>${escapeHtml(formatDocumentTitle(pageTitle))}</h1>`,
    `<p>${escapeHtml(description)}</p>`,
    `<p>Markdown fallback: <a href="${escapeHtml(markdownUrl)}">${escapeHtml(markdownPath)}</a></p>`,
    `<p>Interactive catalog page: <a href="${escapeHtml(htmlUrl)}">${escapeHtml(htmlPath)}</a></p>`,
  ]

  if (agentLines.length > 0) {
    sections.push(`<h2>Agents</h2>\n<pre>${escapeHtml(agentLines)}</pre>`)
  }

  if (flowLines.length > 0) {
    sections.push(`<h2>Flows</h2>\n<pre>${escapeHtml(flowLines)}</pre>`)
  }

  if (detail?.readmeMarkdown) {
    const excerpt = detail.readmeMarkdown.trim().slice(0, 2000)
    sections.push(`<h2>README excerpt</h2>\n<pre>${escapeHtml(excerpt)}</pre>`)
  }

  return [
    `<noscript id="${STATIC_ROUTE_FALLBACK_ID}">`,
    '  <main>',
    `    ${sections.join('\n    ')}`,
    '  </main>',
    '</noscript>',
  ].join('\n')
}

function renderGenericFallback(origin: string, pageTitle: string, description: string): string {
  const homeUrl = escapeHtml(`${origin}/`)

  return [
    `<noscript id="${STATIC_ROUTE_FALLBACK_ID}">`,
    '  <main>',
    `    <h1>${escapeHtml(formatDocumentTitle(pageTitle))}</h1>`,
    `    <p>${escapeHtml(description)}</p>`,
    `    <p><a href="${homeUrl}">${escapeHtml(siteName)}</a></p>`,
    '  </main>',
    '</noscript>',
  ].join('\n')
}

export interface RouteBodyFallbackOptions extends RouteHeadOptions {
  readonly packageDetail?: PackageDetailDocument
}

export function renderRouteBodyFallbackHtml(
  pathname: string,
  siteOriginOverride?: string,
  options: RouteBodyFallbackOptions = {},
): string | null {
  const head = getRouteHeadData(pathname, siteOriginOverride, options)
  const origin = getSiteOrigin(siteOriginOverride)
  const pageMeta = getSitePageMeta(pathname, options.catalog ?? null)
  const { pathnameWithoutLocale } = parseLocaleFromPathname(pathname)

  if (pathnameWithoutLocale === siteRoutes.home) {
    return renderHomeFallback(origin, head.description)
  }

  const packageRoute = parsePackageSitePath(pathnameWithoutLocale)
  if (packageRoute?.kind === 'detail') {
    return renderPackageDetailFallback(
      origin,
      pageMeta.title,
      head.description,
      packageRoute.namespace,
      packageRoute.packageId,
      options.packageDetail,
    )
  }

  if (packageRoute?.kind === 'index' || packageRoute?.kind === 'namespace') {
    return renderGenericFallback(origin, pageMeta.title, head.description)
  }

  return renderGenericFallback(origin, pageMeta.title, head.description)
}

export function injectRouteBodyFallbackIntoHtml(
  html: string,
  pathname: string,
  siteOriginOverride?: string,
  options: RouteBodyFallbackOptions = {},
): string {
  const fallback = renderRouteBodyFallbackHtml(pathname, siteOriginOverride, options)
  if (!fallback) {
    return html
  }

  if (html.includes(`id="${STATIC_ROUTE_FALLBACK_ID}"`)) {
    return html
  }

  return html.replace('<div id="root"></div>', `${fallback}\n    <div id="root"></div>`)
}

export { STATIC_ROUTE_FALLBACK_ID }
