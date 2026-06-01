import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'
import {
  buildRegistryIndexUrl,
  DEFAULT_REGISTRY_INDEX_PATH,
  DEFAULT_REGISTRY_REPOSITORY_URL,
  normalizeRegistryBaseUrl,
} from './src/modules/registry/infrastructure/registrySourceUrl'

interface RuntimeCachingRequestLike {
  method: string
  destination?: string
}

const resolveRegistryIndexUrl = (env: Record<string, string>): string => {
  const repositoryUrl = env.VITE_REGISTRY_REPOSITORY_URL?.trim() || DEFAULT_REGISTRY_REPOSITORY_URL
  const configuredBaseUrl = env.VITE_REGISTRY_BASE_URL?.trim() || repositoryUrl
  const indexPath = env.VITE_REGISTRY_INDEX_PATH?.trim() || DEFAULT_REGISTRY_INDEX_PATH
  const baseUrl = normalizeRegistryBaseUrl(configuredBaseUrl)

  return buildRegistryIndexUrl(baseUrl, indexPath)
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const registryIndexUrl = resolveRegistryIndexUrl(env)

  return {
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
              urlPattern: ({ request, url }: { request: RuntimeCachingRequestLike; url: URL }) => {
                return request.method === 'GET' && url.href === registryIndexUrl
              },
              handler: 'NetworkFirst',
              options: {
                cacheName: 'registry-index-runtime-cache',
                networkTimeoutSeconds: 8,
                expiration: {
                  maxEntries: 2,
                  maxAgeSeconds: 24 * 60 * 60,
                },
              },
            },
            {
              urlPattern: ({ request, url }: { request: RuntimeCachingRequestLike; url: URL }) => {
                return (
                  request.method === 'GET' &&
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
  }
})
