import type { ChatInstructionsManifest } from '../application/chatConsumption'
import { LruCache } from './persistentLruCache'

export const CHAT_INSTRUCTIONS_CACHE_MAX_ENTRIES = 32

const manifestCache = new LruCache<ChatInstructionsManifest>(CHAT_INSTRUCTIONS_CACHE_MAX_ENTRIES)
const markdownCache = new LruCache<string>(CHAT_INSTRUCTIONS_CACHE_MAX_ENTRIES)

export const readCachedChatInstructionsManifest = (
  url: string,
): ChatInstructionsManifest | null => {
  return manifestCache.get(url) ?? null
}

export const writeCachedChatInstructionsManifest = (
  url: string,
  manifest: ChatInstructionsManifest,
): void => {
  manifestCache.set(url, manifest)
}

export const readCachedChatInstructionMarkdown = (url: string): string | null => {
  return markdownCache.get(url) ?? null
}

export const writeCachedChatInstructionMarkdown = (url: string, markdown: string): void => {
  markdownCache.set(url, markdown)
}

export const resetChatInstructionsCacheForTests = (): void => {
  manifestCache.clear()
  markdownCache.clear()
}
