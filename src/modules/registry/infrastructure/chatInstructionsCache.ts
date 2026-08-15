import type { ChatInstructionsManifest } from '../application/chatConsumption'

export const CHAT_INSTRUCTIONS_CACHE_MAX_ENTRIES = 32

class ChatInstructionsLruCache<T> {
  readonly #entries = new Map<string, T>()

  get(url: string): T | undefined {
    const entry = this.#entries.get(url)

    if (entry === undefined) {
      return undefined
    }

    this.#entries.delete(url)
    this.#entries.set(url, entry)

    return entry
  }

  set(url: string, value: T): void {
    if (this.#entries.has(url)) {
      this.#entries.delete(url)
    }

    this.#entries.set(url, value)

    while (this.#entries.size > CHAT_INSTRUCTIONS_CACHE_MAX_ENTRIES) {
      const oldestKey = this.#entries.keys().next().value

      if (oldestKey === undefined) {
        break
      }

      this.#entries.delete(oldestKey)
    }
  }

  clear(): void {
    this.#entries.clear()
  }
}

const manifestCache = new ChatInstructionsLruCache<ChatInstructionsManifest>()
const markdownCache = new ChatInstructionsLruCache<string>()

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
