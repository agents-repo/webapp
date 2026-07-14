import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'
import Sitemap from 'vite-plugin-sitemap'
import { getSiteRoutePaths, resolveBuildSiteOrigin } from './scripts/seo-build-config.ts'

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
export default defineConfig(({ mode }) => {
  const siteOrigin = resolveBuildSiteOrigin(mode)

  return {
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'vendor-react',
                test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
              },
              {
                name: 'vendor-ui',
                test: /node_modules[\\/](react-bootstrap|bootstrap|@popperjs|@restart|classnames|prop-types|invariant|warning|dom-helpers|uncontrollable)[\\/]/,
              },
            ],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      clearMocks: true,
      exclude: [...configDefaults.exclude, '**/dist/**', 'e2e/**', 'test/**'],
    },
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
          'og-image.png',
          'robots.txt',
          'sitemap.xml',
          'site.webmanifest',
          'web-app-manifest-192x192.png',
          'web-app-manifest-512x512.png',
        ],
        includeManifestIcons: false,
        workbox: {
          navigateFallbackDenylist: [/^\/sitemap\.xml$/],
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
      Sitemap({
        hostname: siteOrigin,
        dynamicRoutes: getSiteRoutePaths().filter((routePath: string) => routePath !== '/'),
        priority: { '*': 0.8, '/': 1.0 },
        changefreq: 'monthly',
        generateRobotsTxt: true,
      }),
    ],
  }
})
