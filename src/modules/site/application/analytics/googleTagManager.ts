import { isProductionAnalyticsEnabled } from './analyticsEnvironment.ts'

export const DEFAULT_GTM_CONTAINER_ID = 'GTM-57FJBZ7P'

const gtmScriptMarkerAttribute = 'data-gtm-id'
const gtmContainerIdPattern = /^GTM-[A-Z0-9]+$/

export function isValidGtmContainerId(id: string): boolean {
  return gtmContainerIdPattern.test(id)
}

export function resolveGtmContainerId(): string | null {
  const fromEnv = import.meta.env.VITE_GTM_ID?.trim()
  const id = fromEnv || DEFAULT_GTM_CONTAINER_ID

  if (!isValidGtmContainerId(id)) {
    console.error(`[analytics] Invalid VITE_GTM_ID: ${fromEnv ?? id}`)
    return null
  }

  return id
}

function getGtmScriptElement(containerId: string): HTMLScriptElement | null {
  if (typeof document === 'undefined') {
    return null
  }

  return document.querySelector<HTMLScriptElement>(`script[${gtmScriptMarkerAttribute}="${containerId}"]`)
}

export function loadGoogleTagManager(containerId?: string): void {
  if (!isProductionAnalyticsEnabled()) {
    return
  }

  if (typeof document === 'undefined') {
    return
  }

  let resolvedContainerId: string | null

  if (containerId === undefined) {
    resolvedContainerId = resolveGtmContainerId()
  } else if (!isValidGtmContainerId(containerId)) {
    console.error(`[analytics] Invalid GTM container ID: ${containerId}`)
    return
  } else {
    resolvedContainerId = containerId
  }

  if (!resolvedContainerId) {
    return
  }

  if (getGtmScriptElement(resolvedContainerId)) {
    return
  }

  const script = document.createElement('script')
  script.setAttribute(gtmScriptMarkerAttribute, resolvedContainerId)
  script.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${resolvedContainerId}');`

  document.head.appendChild(script)
}
