import { afterEach, describe, expect, it } from 'vitest'
import type { ChatInstructionsManifest } from '../application/chatConsumption'
import {
  CHAT_INSTRUCTIONS_CACHE_MAX_ENTRIES,
  readCachedChatInstructionMarkdown,
  readCachedChatInstructionsManifest,
  resetChatInstructionsCacheForTests,
  writeCachedChatInstructionMarkdown,
  writeCachedChatInstructionsManifest,
} from './chatInstructionsCache'

const sampleManifest = (id: string): ChatInstructionsManifest => ({
  schemaVersion: '1.0.0',
  package: `agents-repo/${id}`,
  version: '1.0.0',
  instructions: [
    {
      kind: 'agent',
      id,
      path: `/pkg/agents-repo/${id}/1.0.0/agents/${id}.agent.md`,
    },
  ],
})

describe('chatInstructionsCache', () => {
  afterEach(() => {
    resetChatInstructionsCacheForTests()
  })

  it('returns null for unread URLs and stores manifest and markdown by URL', () => {
    expect(readCachedChatInstructionsManifest('https://example.test/a')).toBeNull()
    expect(readCachedChatInstructionMarkdown('https://example.test/a.md')).toBeNull()

    const manifest = sampleManifest('hello-agent')
    writeCachedChatInstructionsManifest('https://example.test/a', manifest)
    writeCachedChatInstructionMarkdown('https://example.test/a.md', '# Hello')

    expect(readCachedChatInstructionsManifest('https://example.test/a')).toEqual(manifest)
    expect(readCachedChatInstructionMarkdown('https://example.test/a.md')).toBe('# Hello')
  })

  it('evicts the oldest unread entry when the LRU is full', () => {
    for (let index = 0; index < CHAT_INSTRUCTIONS_CACHE_MAX_ENTRIES; index += 1) {
      writeCachedChatInstructionsManifest(
        `https://example.test/manifest/${index}`,
        sampleManifest(`agent-${index}`),
      )
      writeCachedChatInstructionMarkdown(`https://example.test/markdown/${index}`, `# ${index}`)
    }

    writeCachedChatInstructionsManifest(
      'https://example.test/manifest/overflow',
      sampleManifest('overflow'),
    )
    writeCachedChatInstructionMarkdown('https://example.test/markdown/overflow', '# overflow')

    expect(readCachedChatInstructionsManifest('https://example.test/manifest/0')).toBeNull()
    expect(readCachedChatInstructionMarkdown('https://example.test/markdown/0')).toBeNull()
    expect(readCachedChatInstructionsManifest('https://example.test/manifest/1')).not.toBeNull()
    expect(readCachedChatInstructionsManifest('https://example.test/manifest/overflow')).toEqual(
      sampleManifest('overflow'),
    )
  })

  it('treats a read as a recency touch so the entry is not evicted next', () => {
    for (let index = 0; index < CHAT_INSTRUCTIONS_CACHE_MAX_ENTRIES; index += 1) {
      writeCachedChatInstructionsManifest(
        `https://example.test/manifest/${index}`,
        sampleManifest(`agent-${index}`),
      )
    }

    expect(readCachedChatInstructionsManifest('https://example.test/manifest/0')).not.toBeNull()

    writeCachedChatInstructionsManifest(
      'https://example.test/manifest/overflow',
      sampleManifest('overflow'),
    )

    expect(readCachedChatInstructionsManifest('https://example.test/manifest/0')).not.toBeNull()
    expect(readCachedChatInstructionsManifest('https://example.test/manifest/1')).toBeNull()
  })
})
