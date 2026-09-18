import { createRouteOgElement } from './route-card-layout.mjs'

/**
 * @param {ReturnType<import('./package-og-inputs.mjs').buildPackageOgRenderInputs>} inputs
 * @param {{ logoDataUrl: string }} options
 * @returns {import('satori').SatoriNode}
 */
export function createPackageDetailOgElement(inputs, { logoDataUrl }) {
  const footerLabels = []
  if (inputs.category) {
    footerLabels.push(inputs.category)
  }
  if (inputs.status && inputs.status !== 'active') {
    footerLabels.push(inputs.status)
  }
  if (footerLabels.length === 0 && inputs.namespace) {
    footerLabels.push(inputs.namespace)
  }

  return createRouteOgElement({
    logoDataUrl,
    heroBadge: inputs.namespace,
    heroTitle: inputs.name,
    heroLead: inputs.description,
    footerLabels: footerLabels.slice(0, 2),
  })
}
