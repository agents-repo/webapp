import { isProductionAnalyticsEnabled } from './analyticsEnvironment.ts'

export const DEFAULT_GTM_CONTAINER_ID = 'GTM-57FJBZ7P'

const gtmScriptMarkerAttribute = 'data-gtm-id'

export function resolveGtmContainerId(): string {
  const fromEnv = import.meta.env.VITE_GTM_ID?.trim()
  const id = fromEnv || DEFAULT_GTM_CONTAINER_ID

  if (!/^GTM-[A-Z0-9]+$/.test(id)) {
    console.error(`[analytics] Invalid VITE_GTM_ID: ${id}`)
    return DEFAULT_GTM_CONTAINER_ID
  }

  return id
}

function getGtmScriptElement(containerId: string): HTMLScriptElement | null {
  if (typeof document === 'undefined') {
    return null
  }

  return document.querySelector<HTMLScriptElement>(`script[${gtmScriptMarkerAttribute}="${containerId}"]`)
}

export function loadGoogleTagManager(containerId = resolveGtmContainerId()): void {
  if (!isProductionAnalyticsEnabled()) {
    return
  }

  if (typeof document === 'undefined') {
    return
  }

  if (getGtmScriptElement(containerId)) {
    return
  }

  const script = document.createElement('script')
  script.setAttribute(gtmScriptMarkerAttribute, containerId)
  script.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');`

  document.head.appendChild(script)
}
