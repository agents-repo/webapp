import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  fetchChatInstructionMarkdown,
  fetchChatInstructionsManifest,
  resetChatInstructionsCacheForTests,
} from './chatInstructionsRepository'

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

const jsonOk = (payload: unknown) => ({
  ok: true,
  json: () => Promise.resolve(payload),
})

describe('chatInstructionsRepository', () => {
  afterEach(async () => {
    await resetChatInstructionsCacheForTests()
    vi.unstubAllGlobals()
  })

  it('parses a successful instructions.json response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonOk(validManifest))
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
        headers: { Accept: 'application/json' },
      }),
    )
    expect(fetchMock.mock.calls[0][1]).not.toMatchObject({ cache: 'no-store' })
  })

  it('reuses a cached instructions.json body for the same URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonOk(validManifest))
    vi.stubGlobal('fetch', fetchMock)
    const url = 'https://example.test/pkg/ns/id/1.0.1/instructions.json'

    await fetchChatInstructionsManifest(url)
    await fetchChatInstructionsManifest(url)

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('fetches again for a different instructions.json URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonOk(validManifest))
    vi.stubGlobal('fetch', fetchMock)

    await fetchChatInstructionsManifest('https://example.test/pkg/ns/id/1.0.1/instructions.json')
    await fetchChatInstructionsManifest('https://example.test/pkg/ns/id/1.0.2/instructions.json')

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not cache failed or invalid instructions.json responses', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce(jsonOk({ schemaVersion: '1.0.0' }))
      .mockResolvedValueOnce(jsonOk({ ...validManifest, instructions: [] }))
      .mockResolvedValueOnce(jsonOk(validManifest))
    vi.stubGlobal('fetch', fetchMock)
    const url = 'https://example.test/missing'

    await expect(fetchChatInstructionsManifest(url)).rejects.toThrow(
      'Unable to load chat instructions (404).',
    )
    await expect(fetchChatInstructionsManifest(url)).rejects.toThrow(
      'Chat instructions response does not match the expected schema.',
    )
    await expect(fetchChatInstructionsManifest(url)).rejects.toThrow(
      'This package has no chat instructions to copy.',
    )
    await expect(fetchChatInstructionsManifest(url)).resolves.toMatchObject({
      package: 'agents-repo/hello-agent',
    })
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('coalesces in-flight requests and ignores caller abort for the shared fetch', async () => {
    let resolveResponse: ((value: unknown) => void) | undefined
    const fetchMock = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveResponse = resolve
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const url = 'https://example.test/pkg/ns/id/1.0.1/instructions.json'
    const controller = new AbortController()

    const aborted = fetchChatInstructionsManifest(url, controller.signal)
    const kept = fetchChatInstructionsManifest(url)
    controller.abort()

    await expect(aborted).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    resolveResponse?.(jsonOk(validManifest))
    await expect(kept).resolves.toMatchObject({ package: 'agents-repo/hello-agent' })
    await expect(fetchChatInstructionsManifest(url)).resolves.toMatchObject({
      package: 'agents-repo/hello-agent',
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('returns instruction markdown and rejects empty or failed fetches', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('# Hello agent'),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('   '),
      })
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchChatInstructionMarkdown('https://example.test/agent.md')).resolves.toBe(
      '# Hello agent',
    )
    await expect(fetchChatInstructionMarkdown('https://example.test/failed.md')).rejects.toThrow(
      'Unable to load instruction markdown (500).',
    )
    await expect(fetchChatInstructionMarkdown('https://example.test/empty.md')).rejects.toThrow(
      'Instruction markdown was empty.',
    )
  })

  it('reuses cached instruction markdown for the same URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('# Hello agent'),
    })
    vi.stubGlobal('fetch', fetchMock)
    const url = 'https://example.test/agent.md'

    await fetchChatInstructionMarkdown(url)
    await fetchChatInstructionMarkdown(url)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        headers: { Accept: 'text/markdown, text/plain, */*' },
      }),
    )
    expect(fetchMock.mock.calls[0][1]).not.toMatchObject({ cache: 'no-store' })
  })
})
