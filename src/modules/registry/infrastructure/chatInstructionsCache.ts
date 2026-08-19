import type { ChatInstructionsManifest } from '../application/chatConsumption'
import { REGISTRY_CACHE_STORES } from './indexedDbCacheBackend.ts'
import { createPersistentLruCache } from './persistentLruCache.ts'

export const CHAT_INSTRUCTIONS_CACHE_MAX_ENTRIES = 64
export const CHAT_MARKDOWN_CACHE_MAX_ENTRIES = 128
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

interface ChatManifestCacheEnvelope {
  cacheKey: string
  cachedAt: number
  manifest: ChatInstructionsManifest
}

interface ChatMarkdownCacheEnvelope {
  cacheKey: string
  cachedAt: number
  markdown: string
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const isManifestEnvelope = (value: unknown): value is ChatManifestCacheEnvelope => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.cacheKey === 'string' &&
    typeof value.cachedAt === 'number' &&
    typeof value.manifest === 'object' &&
    value.manifest !== null
  )
}

const isMarkdownEnvelope = (value: unknown): value is ChatMarkdownCacheEnvelope => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.cacheKey === 'string' &&
    typeof value.cachedAt === 'number' &&
    typeof value.markdown === 'string'
  )
}

const manifestCache = createPersistentLruCache<ChatManifestCacheEnvelope>({
  storeName: REGISTRY_CACHE_STORES.chatManifest,
  maxEntries: CHAT_INSTRUCTIONS_CACHE_MAX_ENTRIES,
  ttlMs: CACHE_TTL_MS,
  getKey: (envelope) => envelope.cacheKey,
  isEnvelope: isManifestEnvelope,
})

const markdownCache = createPersistentLruCache<ChatMarkdownCacheEnvelope>({
  storeName: REGISTRY_CACHE_STORES.chatMarkdown,
  maxEntries: CHAT_MARKDOWN_CACHE_MAX_ENTRIES,
  ttlMs: CACHE_TTL_MS,
  getKey: (envelope) => envelope.cacheKey,
  isEnvelope: isMarkdownEnvelope,
})

export const isVersionPinnedRegistryPayloadUrl = (url: string): boolean => {
  try {
    const { pathname } = new URL(url)
    return /\/versions\/[^/]+\//.test(pathname) || /\/pkg\/[^/]+\/[^/]+\/\d[^/]*\//.test(pathname)
  } catch {
    return false
  }
}

const isUsableCachedEntry = (url: string, cachedAt: number): boolean => {
  if (isVersionPinnedRegistryPayloadUrl(url)) {
    return true
  }

  return manifestCache.isFresh(cachedAt)
}

export const readCachedChatInstructionsManifest = async (
  url: string,
): Promise<ChatInstructionsManifest | null> => {
  const envelope = await manifestCache.get(url)

  if (!envelope || !isUsableCachedEntry(url, envelope.cachedAt)) {
    return null
  }

  return envelope.manifest
}

export const writeCachedChatInstructionsManifest = async (
  url: string,
  manifest: ChatInstructionsManifest,
): Promise<void> => {
  await manifestCache.write(url, {
    cacheKey: url,
    cachedAt: Date.now(),
    manifest,
  })
}

export const readCachedChatInstructionMarkdown = async (url: string): Promise<string | null> => {
  const envelope = await markdownCache.get(url)

  if (!envelope || !isUsableCachedEntry(url, envelope.cachedAt)) {
    return null
  }

  return envelope.markdown
}

export const writeCachedChatInstructionMarkdown = async (
  url: string,
  markdown: string,
): Promise<void> => {
  await markdownCache.write(url, {
    cacheKey: url,
    cachedAt: Date.now(),
    markdown,
  })
}

export const clearRegistryChatInstructionsCache = async (): Promise<void> => {
  await Promise.all([manifestCache.clear(), markdownCache.clear()])
}

export const resetChatInstructionsCacheForTests = async (): Promise<void> => {
  await clearRegistryChatInstructionsCache()
}
