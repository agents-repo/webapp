import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyTextToClipboard } from './copyTextToClipboard'

describe('copyTextToClipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns success when clipboard write succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    await expect(copyTextToClipboard('npx agents-repo install foo/bar')).resolves.toBe('success')
    expect(writeText).toHaveBeenCalledWith('npx agents-repo install foo/bar')
  })

  it('returns failure when clipboard is unavailable', async () => {
    vi.stubGlobal('navigator', {})

    await expect(copyTextToClipboard('test')).resolves.toBe('failure')
  })

  it('returns failure when write throws', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    })

    await expect(copyTextToClipboard('test')).resolves.toBe('failure')
  })
})
