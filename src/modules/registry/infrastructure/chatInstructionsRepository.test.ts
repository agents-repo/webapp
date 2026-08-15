import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchChatInstructionMarkdown, fetchChatInstructionsManifest } from './chatInstructionsRepository'

const validManifest = {
  schemaVersion: '1.0.0',
  package: 'agents-repo/hello-agent',
  version: '1.0.1',
  instructions: [
    {
      kind: 'agent',
      id: 'hello-agent',
      path: '/pkg/agents-repo/hello-agent/1.0.1/agents/hello-agent.agent.md',
    },
  ],
}

describe('chatInstructionsRepository', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('parses a successful instructions.json response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validManifest),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      fetchChatInstructionsManifest('https://example.test/pkg/ns/id/1.0.1/instructions.json'),
    ).resolves.toEqual({
      schemaVersion: '1.0.0',
      package: 'agents-repo/hello-agent',
      version: '1.0.1',
      instructions: validManifest.instructions,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test/pkg/ns/id/1.0.1/instructions.json',
      expect.objectContaining({
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      }),
    )
  })

  it('throws when instructions.json is missing, invalid, or empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    )
    await expect(fetchChatInstructionsManifest('https://example.test/missing')).rejects.toThrow(
      'Unable to load chat instructions (404).',
    )

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ schemaVersion: '1.0.0' }),
      }),
    )
    await expect(fetchChatInstructionsManifest('https://example.test/invalid')).rejects.toThrow(
      'Chat instructions response does not match the expected schema.',
    )

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ...validManifest, instructions: [] }),
      }),
    )
    await expect(fetchChatInstructionsManifest('https://example.test/empty')).rejects.toThrow(
      'This package has no chat instructions to copy.',
    )
  })

  it('returns instruction markdown and rejects empty or failed fetches', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('# Hello agent'),
      }),
    )
    await expect(fetchChatInstructionMarkdown('https://example.test/agent.md')).resolves.toBe('# Hello agent')

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    )
    await expect(fetchChatInstructionMarkdown('https://example.test/agent.md')).rejects.toThrow(
      'Unable to load instruction markdown (500).',
    )

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('   '),
      }),
    )
    await expect(fetchChatInstructionMarkdown('https://example.test/agent.md')).rejects.toThrow(
      'Instruction markdown was empty.',
    )
  })
})
