import { parseChatInstructionsManifest, type ChatInstructionsManifest } from '../application/chatConsumption'
import {
  readCachedChatInstructionMarkdown,
  readCachedChatInstructionsManifest,
  resetChatInstructionsCacheForTests as resetChatInstructionsLruCacheForTests,
  writeCachedChatInstructionMarkdown,
  writeCachedChatInstructionsManifest,
} from './chatInstructionsCache'

export { readCachedChatInstructionsManifest } from './chatInstructionsCache'

const inflightManifestByUrl = new Map<string, Promise<ChatInstructionsManifest>>()
const inflightMarkdownByUrl = new Map<string, Promise<string>>()

export const resetChatInstructionsCacheForTests = (): void => {
  inflightManifestByUrl.clear()
  inflightMarkdownByUrl.clear()
  resetChatInstructionsLruCacheForTests()
}

const abortError = (): DOMException => {
  return new DOMException('The operation was aborted.', 'AbortError')
}

const settleWithCallerSignal = async <T>(value: Promise<T> | T, signal?: AbortSignal): Promise<T> => {
  if (signal?.aborted) {
    throw abortError()
  }

  if (!(value instanceof Promise)) {
    return value
  }

  if (!signal) {
    return value
  }

  return new Promise<T>((resolve, reject) => {
    const onAbort = (): void => {
      signal.removeEventListener('abort', onAbort)
      reject(abortError())
    }

    signal.addEventListener('abort', onAbort, { once: true })

    value.then(
      (resolved) => {
        signal.removeEventListener('abort', onAbort)
        resolve(resolved)
      },
      (error: unknown) => {
        signal.removeEventListener('abort', onAbort)
        reject(error instanceof Error ? error : new Error(String(error)))
      },
    )
  })
}

const loadChatInstructionsManifestFromNetwork = async (
  url: string,
): Promise<ChatInstructionsManifest> => {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Unable to load chat instructions (${response.status}).`)
  }

  const payload: unknown = await response.json()
  const parsed = parseChatInstructionsManifest(payload)

  if (!parsed) {
    throw new Error('Chat instructions response does not match the expected schema.')
  }

  if (parsed.instructions.length === 0) {
    throw new Error('This package has no chat instructions to copy.')
  }

  writeCachedChatInstructionsManifest(url, parsed)
  return parsed
}

const loadChatInstructionMarkdownFromNetwork = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    headers: { Accept: 'text/markdown, text/plain, */*' },
  })

  if (!response.ok) {
    throw new Error(`Unable to load instruction markdown (${response.status}).`)
  }

  const markdown = await response.text()
  if (!markdown.trim()) {
    throw new Error('Instruction markdown was empty.')
  }

  writeCachedChatInstructionMarkdown(url, markdown)
  return markdown
}

const getOrLoad = <T>(
  url: string,
  cached: T | null,
  inflight: Map<string, Promise<T>>,
  load: (url: string) => Promise<T>,
  signal?: AbortSignal,
): Promise<T> => {
  if (cached !== null) {
    return settleWithCallerSignal(cached, signal)
  }

  let pending = inflight.get(url)
  if (!pending) {
    pending = load(url).finally(() => {
      inflight.delete(url)
    })
    inflight.set(url, pending)
  }

  return settleWithCallerSignal(pending, signal)
}

export const fetchChatInstructionsManifest = async (
  url: string,
  signal?: AbortSignal,
): Promise<ChatInstructionsManifest> => {
  return getOrLoad(
    url,
    readCachedChatInstructionsManifest(url),
    inflightManifestByUrl,
    loadChatInstructionsManifestFromNetwork,
    signal,
  )
}

export const fetchChatInstructionMarkdown = async (
  url: string,
  signal?: AbortSignal,
): Promise<string> => {
  return getOrLoad(
    url,
    readCachedChatInstructionMarkdown(url),
    inflightMarkdownByUrl,
    loadChatInstructionMarkdownFromNetwork,
    signal,
  )
}
