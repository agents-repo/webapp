/**
 * Workbox matcher helpers for vite-plugin-pwa.
 * Keep crawl-file exclusions in one place so the HTML NetworkFirst urlPattern
 * can be unit-tested. Workbox serializes urlPattern with toString(), so
 * isHtmlNavigationRequest inlines those regexes instead of calling helpers.
 */

export interface RuntimeCachingRequestLike {
  method: string
  mode?: string
  destination?: string
}

export interface RuntimeCachingUrlMatchContext {
  request: RuntimeCachingRequestLike
  url: URL
  sameOrigin?: boolean
}

export const CRAWL_FILE_NAVIGATE_DENYLIST: readonly RegExp[] = [
  /^\/sitemap\.xml$/,
  /^\/robots\.txt$/,
  /^\/llms\.txt$/,
  /^\/docs\/[^/]+\.md$/,
]

/** Precache hashed assets. HTML is not globbed so `/` is not served from precache. */
export const WORKBOX_GLOB_PATTERNS: readonly string[] = [
  '**/*.{js,css,ico,png,svg,webp,woff,woff2,jpg,jpeg}',
]

export const WORKBOX_GLOB_IGNORES: readonly string[] = ['**/*.map', '**/vendor-mermaid-*.js']

export const HTML_PAGES_CACHE_NAME = 'html-pages-cache'
export const HTML_PAGES_MAX_ENTRIES = 50
export const HTML_PAGES_MAX_AGE_SECONDS = 24 * 60 * 60
export const HTML_NAVIGATION_NETWORK_TIMEOUT_SECONDS = 3

export const APP_STATIC_RUNTIME_CACHE_NAME = 'app-static-runtime-cache'
export const APP_STATIC_RUNTIME_MAX_ENTRIES = 80
export const APP_STATIC_RUNTIME_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

export function isCrawlFilePath(pathname: string): boolean {
  return CRAWL_FILE_NAVIGATE_DENYLIST.some((pattern) => pattern.test(pathname))
}

export function isHtmlNavigationRequest({
  request,
  url,
  sameOrigin,
}: RuntimeCachingUrlMatchContext): boolean {
  // Inline crawl-file checks. Workbox serializes urlPattern with toString(), so
  // this function must not call other module helpers.
  return (
    request.method === 'GET' &&
    sameOrigin === true &&
    request.mode === 'navigate' &&
    !/^\/sitemap\.xml$/.test(url.pathname) &&
    !/^\/robots\.txt$/.test(url.pathname) &&
    !/^\/llms\.txt$/.test(url.pathname) &&
    !/^\/docs\/[^/]+\.md$/.test(url.pathname)
  )
}

export function isStaticAssetRuntimeRequest({
  request,
  url,
  sameOrigin,
}: RuntimeCachingUrlMatchContext): boolean {
  return (
    request.method === 'GET' &&
    sameOrigin === true &&
    !url.pathname.endsWith('.json') &&
    (request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'font' ||
      request.destination === 'image')
  )
}
