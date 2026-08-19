import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ChatInstructionsManifest } from '../application/chatConsumption'
import {
  CHAT_INSTRUCTIONS_CACHE_MAX_ENTRIES,
  isVersionPinnedRegistryPayloadUrl,
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
  afterEach(async () => {
    await resetChatInstructionsCacheForTests()
    vi.useRealTimers()
  })

  it('returns null for unread URLs and stores manifest and markdown by URL', async () => {
    await expect(readCachedChatInstructionsManifest('https://example.test/a')).resolves.toBeNull()
    await expect(readCachedChatInstructionMarkdown('https://example.test/a.md')).resolves.toBeNull()

    const manifest = sampleManifest('hello-agent')
    await writeCachedChatInstructionsManifest('https://example.test/pkg/ns/id/1.0.0/instructions.json', manifest)
    await writeCachedChatInstructionMarkdown(
      'https://example.test/pkg/ns/id/1.0.0/agents/a.agent.md',
      '# Hello',
    )

    await expect(
      readCachedChatInstructionsManifest('https://example.test/pkg/ns/id/1.0.0/instructions.json'),
    ).resolves.toEqual(manifest)
    await expect(
      readCachedChatInstructionMarkdown('https://example.test/pkg/ns/id/1.0.0/agents/a.agent.md'),
    ).resolves.toBe('# Hello')
  })

  it('evicts the oldest unread entry when the LRU is full', async () => {
    for (let index = 0; index < CHAT_INSTRUCTIONS_CACHE_MAX_ENTRIES; index += 1) {
      await writeCachedChatInstructionsManifest(
        `https://example.test/pkg/ns/id/1.0.0/manifest/${index}`,
        sampleManifest(`agent-${index}`),
      )
    }

    await writeCachedChatInstructionsManifest(
      'https://example.test/pkg/ns/id/1.0.0/manifest/overflow',
      sampleManifest('overflow'),
    )

    await expect(
      readCachedChatInstructionsManifest('https://example.test/pkg/ns/id/1.0.0/manifest/0'),
    ).resolves.toBeNull()
    await expect(
      readCachedChatInstructionsManifest('https://example.test/pkg/ns/id/1.0.0/manifest/1'),
    ).resolves.not.toBeNull()
    await expect(
      readCachedChatInstructionsManifest('https://example.test/pkg/ns/id/1.0.0/manifest/overflow'),
    ).resolves.toEqual(sampleManifest('overflow'))
  })

  it('treats a read as a recency touch so the entry is not evicted next', async () => {
    for (let index = 0; index < CHAT_INSTRUCTIONS_CACHE_MAX_ENTRIES; index += 1) {
      await writeCachedChatInstructionsManifest(
        `https://example.test/pkg/ns/id/1.0.0/manifest/${index}`,
        sampleManifest(`agent-${index}`),
      )
    }

    await expect(
      readCachedChatInstructionsManifest('https://example.test/pkg/ns/id/1.0.0/manifest/0'),
    ).resolves.not.toBeNull()

    await writeCachedChatInstructionsManifest(
      'https://example.test/pkg/ns/id/1.0.0/manifest/overflow',
      sampleManifest('overflow'),
    )

    await expect(
      readCachedChatInstructionsManifest('https://example.test/pkg/ns/id/1.0.0/manifest/0'),
    ).resolves.not.toBeNull()
    await expect(
      readCachedChatInstructionsManifest('https://example.test/pkg/ns/id/1.0.0/manifest/1'),
    ).resolves.toBeNull()
  })

  it('detects version-pinned registry payload URLs', () => {
    expect(
      isVersionPinnedRegistryPayloadUrl(
        'https://example.test/pkg/agents-repo/hello/1.0.1/agents/hello.agent.md',
      ),
    ).toBe(true)
    expect(
      isVersionPinnedRegistryPayloadUrl(
        'https://example.test/packages/ns/id/versions/1.0.0/agents/hello.agent.md',
      ),
    ).toBe(true)
    expect(
      isVersionPinnedRegistryPayloadUrl(
        'https://example.test/pkg/agents-repo/hello/agents/hello.agent.md?ref=v2.x',
      ),
    ).toBe(false)
  })

  it('applies a 24h TTL to latest-alias markdown and skips TTL for version-pinned URLs', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    const latestUrl = 'https://example.test/pkg/ns/pkg/agents/foo.agent.md?ref=v2.x'
    const pinnedUrl = 'https://example.test/pkg/ns/pkg/1.0.0/agents/foo.agent.md?ref=v2.x'
    await writeCachedChatInstructionMarkdown(latestUrl, '# latest')
    await writeCachedChatInstructionMarkdown(pinnedUrl, '# pinned')

    vi.setSystemTime(new Date('2026-01-02T00:00:01.000Z'))
    await expect(readCachedChatInstructionMarkdown(latestUrl)).resolves.toBeNull()
    await expect(readCachedChatInstructionMarkdown(pinnedUrl)).resolves.toBe('# pinned')
  })
})
