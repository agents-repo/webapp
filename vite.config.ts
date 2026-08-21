import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'
import Sitemap from 'vite-plugin-sitemap'
import { getBuildSiteRoutePaths, publicSitePath, resolveBuildSiteOrigin } from './scripts/seo-build-config.ts'
import {
  APP_STATIC_RUNTIME_CACHE_NAME,
  APP_STATIC_RUNTIME_MAX_AGE_SECONDS,
  APP_STATIC_RUNTIME_MAX_ENTRIES,
  HTML_NAVIGATION_NETWORK_TIMEOUT_SECONDS,
  HTML_PAGES_CACHE_NAME,
  HTML_PAGES_MAX_AGE_SECONDS,
  HTML_PAGES_MAX_ENTRIES,
  WORKBOX_GLOB_IGNORES,
  WORKBOX_GLOB_PATTERNS,
  isHtmlNavigationRequest,
  isStaticAssetRuntimeRequest,
} from './scripts/pwa-workbox.ts'

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
              {
                name: 'vendor-mermaid',
                test: /node_modules[\\/](mermaid|@mermaid-js)[\\/]/,
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
          'og-image.jpg',
          'og-image.png',
          'site.webmanifest',
          'web-app-manifest-192x192.png',
          'web-app-manifest-512x512.png',
        ],
        includeManifestIcons: false,
        workbox: {
          // sitemap.xml and robots.txt are generated post-build; precache cannot
          // include them via includeAssets. The HTML NetworkFirst matcher skips
          // those crawl-file navigations so the browser receives the static files.
          // mermaid is lazy-loaded for package README diagrams and exceeds
          // Workbox's 2 MiB precache limit; runtime caching still covers it.
          // HTML is omitted from globPatterns. directoryIndex is disabled so `/`
          // is not rewritten onto a precached shell. navigateFallback is off:
          // generateSW registers NavigationRoute before runtimeCaching, which
          // would otherwise serve frozen index.html for every navigation.
          globPatterns: [...WORKBOX_GLOB_PATTERNS],
          globIgnores: [...WORKBOX_GLOB_IGNORES],
          directoryIndex: null,
          navigateFallback: null,
          runtimeCaching: [
            {
              urlPattern: isHtmlNavigationRequest,
              handler: 'NetworkFirst',
              options: {
                cacheName: HTML_PAGES_CACHE_NAME,
                networkTimeoutSeconds: HTML_NAVIGATION_NETWORK_TIMEOUT_SECONDS,
                expiration: {
                  maxEntries: HTML_PAGES_MAX_ENTRIES,
                  maxAgeSeconds: HTML_PAGES_MAX_AGE_SECONDS,
                },
                cacheableResponse: {
                  statuses: [200],
                },
              },
            },
            {
              urlPattern: isStaticAssetRuntimeRequest,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: APP_STATIC_RUNTIME_CACHE_NAME,
                expiration: {
                  maxEntries: APP_STATIC_RUNTIME_MAX_ENTRIES,
                  maxAgeSeconds: APP_STATIC_RUNTIME_MAX_AGE_SECONDS,
                },
              },
            },
          ],
        },
      }),
      Sitemap({
        hostname: siteOrigin,
        dynamicRoutes: getBuildSiteRoutePaths()
          .filter((routePath: string) => routePath !== '/')
          .map((routePath: string) => publicSitePath(routePath)),
        priority: { '*': 0.8, '/': 1.0 },
        changefreq: 'monthly',
        generateRobotsTxt: true,
      }),
    ],
  }
})
