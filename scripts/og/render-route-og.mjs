import { loadBrandLogoDataUrl, renderOgElementToJpeg } from './render-lib.mjs'
import { ROUTE_OG_ARTIFACTS } from './routes.mjs'

/**
 * @param {string} routeId
 * @returns {Promise<Buffer>}
 */
export async function renderRouteOgJpeg(routeId) {
  if (!ROUTE_OG_ARTIFACTS.some((entry) => entry.id === routeId)) {
    throw new Error(`Unknown route OG id: ${routeId}`)
  }

  const { createHomeOgElement } = await import('./home-card.mjs')
  const { createPackagesOgElement } = await import('./packages-card.mjs')
  const { createDocsOgElement } = await import('./docs-card.mjs')

  const factories = {
    home: createHomeOgElement,
    packages: createPackagesOgElement,
    docs: createDocsOgElement,
  }

  const createElement = factories[routeId]
  if (!createElement) {
    throw new Error(`No OG card factory for route id: ${routeId}`)
  }

  const logoDataUrl = await loadBrandLogoDataUrl()
  return renderOgElementToJpeg(createElement({ logoDataUrl }))
}

/**
 * @returns {Promise<Record<string, Buffer>>}
 */
export async function renderAllRouteOgJpegs() {
  /** @type {Record<string, Buffer>} */
  const out = {}
  for (const { id } of ROUTE_OG_ARTIFACTS) {
    out[id] = await renderRouteOgJpeg(id)
  }
  return out
}
