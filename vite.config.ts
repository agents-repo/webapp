import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { VitePWA } from 'vite-plugin-pwa'

const DEFAULT_REGISTRY_REPOSITORY_URL = 'https://github.com/agents-repo/registry'
const DEFAULT_REGISTRY_INDEX_PATH = 'packages/index.json'
const DEFAULT_REGISTRY_BRANCH = 'main'

interface RuntimeCachingRequestLike {
  method: string
  destination?: string
}

const trimTrailingSlashes = (value: string): string => {
  let output = value

  while (output.endsWith('/')) {
    output = output.slice(0, -1)
  }

  return output
}

const trimLeadingSlashes = (value: string): string => {
  let output = value

  while (output.startsWith('/')) {
    output = output.slice(1)
  }

  return output
}

const normalizeRegistryBaseUrl = (value: string): string => {
  const normalized = trimTrailingSlashes(value.trim())

  try {
    const parsedUrl = new URL(normalized)
    const segments = parsedUrl.pathname.split('/').filter((segment) => segment.length > 0)

    if (parsedUrl.hostname !== 'github.com' || segments.length < 2) {
      return normalized
    }

    const owner = segments[0]
    const repository = segments[1]
    const branch =
      segments.length >= 4 && segments[2] === 'blob' ? segments[3] : DEFAULT_REGISTRY_BRANCH

    return `https://raw.githubusercontent.com/${owner}/${repository}/${branch}`
  } catch {
    return normalized
  }
}

const buildRegistryIndexUrl = (env: Record<string, string>): string => {
  const repositoryUrl = env.VITE_REGISTRY_REPOSITORY_URL?.trim() || DEFAULT_REGISTRY_REPOSITORY_URL
  const configuredBaseUrl = env.VITE_REGISTRY_BASE_URL?.trim() || repositoryUrl
  const indexPath = env.VITE_REGISTRY_INDEX_PATH?.trim() || DEFAULT_REGISTRY_INDEX_PATH
  const baseUrl = normalizeRegistryBaseUrl(configuredBaseUrl)

  return `${trimTrailingSlashes(baseUrl)}/${trimLeadingSlashes(indexPath)}`
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const registryIndexUrl = buildRegistryIndexUrl(env)

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
