import { loadBrandLogoDataUrl, renderOgElementToJpeg } from './render-lib.mjs'
import { ROUTE_OG_ARTIFACTS } from './routes.mjs'

/** @param {string} routeId */
function cardFactoryExportName(routeId) {
  return `create${routeId.charAt(0).toUpperCase()}${routeId.slice(1)}OgElement`
}

/**
 * @param {string} routeId
 * @returns {Promise<Buffer>}
 */
export async function renderRouteOgJpeg(routeId) {
  const artifact = ROUTE_OG_ARTIFACTS.find((entry) => entry.id === routeId)
  if (!artifact) {
    throw new Error(`Unknown route OG id: ${routeId}`)
  }

  const cardModule = await import(artifact.cardModule)
  const createElement = cardModule[cardFactoryExportName(routeId)]
  if (typeof createElement !== 'function') {
    throw new TypeError(`No OG card factory export in ${artifact.cardModule} for route id: ${routeId}`)
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
