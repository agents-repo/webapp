import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePwaInstall } from './usePwaInstall'

const { mockIsRunningAsInstalledPwa, mockRunPwaInstallPrompt } = vi.hoisted(() => ({
  mockIsRunningAsInstalledPwa: vi.fn(() => false),
  mockRunPwaInstallPrompt: vi.fn(),
}))

vi.mock('./pwaInstall', async () => {
  const actual = await vi.importActual('./pwaInstall')

  return {
    ...actual,
    isRunningAsInstalledPwa: mockIsRunningAsInstalledPwa,
    runPwaInstallPrompt: mockRunPwaInstallPrompt,
  }
})

const createInstallPromptEvent = () => {
  const event = new Event('beforeinstallprompt') as Event & {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted'; platform: string }>
  }
  event.preventDefault = vi.fn()
  event.prompt = vi.fn().mockResolvedValue(undefined)
  event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })

  return event
}

describe('usePwaInstall', () => {
  beforeEach(() => {
    mockRunPwaInstallPrompt.mockResolvedValue('unavailable')
  })

  afterEach(() => {
    vi.clearAllMocks()
    mockIsRunningAsInstalledPwa.mockReturnValue(false)
    mockRunPwaInstallPrompt.mockReset()
    mockRunPwaInstallPrompt.mockResolvedValue('unavailable')
  })

  it('exposes install availability after beforeinstallprompt fires', async () => {
    const { result } = renderHook(() => usePwaInstall())

    expect(result.current.canInstall).toBe(false)

    act(() => {
      globalThis.window.dispatchEvent(createInstallPromptEvent())
    })

    await waitFor(() => {
      expect(result.current.canInstall).toBe(true)
    })
  })

  it('clears the deferred prompt after a successful install prompt', async () => {
    mockRunPwaInstallPrompt.mockResolvedValue('accepted')

    const { result } = renderHook(() => usePwaInstall())

    act(() => {
      globalThis.window.dispatchEvent(createInstallPromptEvent())
    })

    await waitFor(() => {
      expect(result.current.canInstall).toBe(true)
    })

    await act(async () => {
      await result.current.promptInstall()
    })

    expect(mockRunPwaInstallPrompt).toHaveBeenCalled()
    expect(result.current.canInstall).toBe(false)
  })

  it('clears the deferred prompt when the appinstalled event fires', async () => {
    const { result } = renderHook(() => usePwaInstall())

    act(() => {
      globalThis.window.dispatchEvent(createInstallPromptEvent())
    })

    await waitFor(() => {
      expect(result.current.canInstall).toBe(true)
    })

    act(() => {
      globalThis.window.dispatchEvent(new Event('appinstalled'))
    })

    await waitFor(() => {
      expect(result.current.canInstall).toBe(false)
    })
  })
})
