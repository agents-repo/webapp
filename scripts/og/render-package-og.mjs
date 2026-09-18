import { loadBrandLogoDataUrl, renderOgElementToJpeg } from './render-lib.mjs'
import { buildPackageOgRenderInputs } from './package-og-inputs.mjs'
import { createPackageDetailOgElement } from './package-detail-card.mjs'

/**
 * @param {{ namespace: string, package: string, name: string, description: string, category?: string, status?: string }} catalogPackage
 * @returns {Promise<Buffer>}
 */
export async function renderPackageDetailOgJpeg(catalogPackage) {
  const inputs = buildPackageOgRenderInputs(catalogPackage)
  const logoDataUrl = await loadBrandLogoDataUrl()
  return renderOgElementToJpeg(createPackageDetailOgElement(inputs, { logoDataUrl }))
}
