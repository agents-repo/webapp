import { createSiteDefaultOgElement } from './site-default-card.mjs'
import { loadBrandLogoDataUrl, renderOgElementToJpeg } from './render-lib.mjs'

/**
 * @returns {Promise<Buffer>} JPEG bytes for the site default OG card.
 */
export async function renderSiteDefaultOgJpeg() {
  const logoDataUrl = await loadBrandLogoDataUrl()
  return renderOgElementToJpeg(createSiteDefaultOgElement({ logoDataUrl }))
}

export { loadBrandLogoDataUrl } from './render-lib.mjs'
