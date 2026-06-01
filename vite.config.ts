import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'

interface RuntimeCachingRequestLike {
  method: string
  destination?: string
}

interface RuntimeCachingUrlMatchContext {
  request: RuntimeCachingRequestLike
  url: URL
  sameOrigin?: boolean
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      manifest: false,
      includeAssets: [
        'apple-touch-icon.png',
        'favicon-96x96.png',
        'favicon.ico',
        'favicon.svg',
        'icons.svg',
        'site.webmanifest',
        'web-app-manifest-192x192.png',
        'web-app-manifest-512x512.png',
      ],
      includeManifestIcons: false,
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request, url, sameOrigin }: RuntimeCachingUrlMatchContext) => {
              return (
                request.method === 'GET' &&
                sameOrigin === true &&
                !url.pathname.endsWith('.json') &&
                (request.destination === 'style' ||
                  request.destination === 'script' ||
                  request.destination === 'font' ||
                  request.destination === 'image')
              )
            },
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-static-runtime-cache',
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
    }),
  ],
})
