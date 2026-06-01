declare module 'lru-cache' {
  export interface LRUCacheOptions {
    max?: number
    ttl?: number
    updateAgeOnGet?: boolean
  }

  export interface LRUCacheSetOptions {
    ttl?: number
  }

  export class LRUCache<K, V> {
    constructor(options?: LRUCacheOptions)
    get(key: K): V | undefined
    set(key: K, value: V, options?: LRUCacheSetOptions): this
    values(): IterableIterator<V>
  }
}

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean
  }

  export function registerSW(options?: RegisterSWOptions): () => void
}

declare module 'vite-plugin-pwa' {
  import type { PluginOption } from 'vite'

  export interface VitePWAOptions {
    registerType?: 'autoUpdate' | 'prompt'
    injectRegister?: 'auto' | 'script' | 'inline' | false
    includeAssets?: string[]
    manifest?: {
      name?: string
      short_name?: string
      description?: string
      theme_color?: string
      background_color?: string
      display?: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser'
      start_url?: string
      icons?: Array<{
        src: string
        sizes: string
        type?: string
        purpose?: string
      }>
    }
    workbox?: {
      runtimeCaching?: Array<{
        urlPattern: (params: { request: Request; url: URL }) => boolean
        handler: 'NetworkFirst' | 'StaleWhileRevalidate'
        options?: {
          cacheName?: string
          networkTimeoutSeconds?: number
          expiration?: {
            maxEntries?: number
            maxAgeSeconds?: number
          }
        }
      }>
    }
  }

  export function VitePWA(options?: VitePWAOptions): PluginOption | PluginOption[]
}