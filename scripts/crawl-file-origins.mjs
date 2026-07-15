/** Test-only origin; must not appear in production crawl files. */
export const previewTestOrigin = 'https://preview.example.test'

export const previewTestHostname = new URL(previewTestOrigin).hostname
