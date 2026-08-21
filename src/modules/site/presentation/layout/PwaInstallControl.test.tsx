import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../../test/renderWithProviders'
import { publicSitePath } from '../routes/siteRoutes'
import { getDocDetailPath } from '../../application/docs/docsCatalog'
import PwaInstallControl from './PwaInstallControl'

const {
  mockUsePwaInstall,
  mockIsRunningAsInstalledPwa,
  mockDetectNativeInstallPromptSupport,
} = vi.hoisted(() => ({
  mockUsePwaInstall: vi.fn(),
  mockIsRunningAsInstalledPwa: vi.fn(() => false),
  mockDetectNativeInstallPromptSupport: vi.fn(() => false),
}))

vi.mock('../../application/pwa/usePwaInstall', () => ({
  usePwaInstall: mockUsePwaInstall,
}))

vi.mock('../../application/pwa/pwaInstall', async () => {
  const actual = await vi.importActual('../../application/pwa/pwaInstall')

  return {
    ...actual,
    isRunningAsInstalledPwa: mockIsRunningAsInstalledPwa,
    detectNativeInstallPromptSupport: mockDetectNativeInstallPromptSupport,
  }
})

describe('PwaInstallControl', () => {
  beforeEach(() => {
    mockUsePwaInstall.mockReturnValue({
      canInstall: false,
      isInstalling: false,
      promptInstall: vi.fn(),
    })
    mockIsRunningAsInstalledPwa.mockReturnValue(false)
    mockDetectNativeInstallPromptSupport.mockReturnValue(false)
    vi.stubGlobal('navigator', {
      ...globalThis.navigator,
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
      maxTouchPoints: 0,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('hides the control when the app is already installed', () => {
    mockIsRunningAsInstalledPwa.mockReturnValue(true)

    renderWithProviders(<PwaInstallControl />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('hides the how-to control while Chromium waits for beforeinstallprompt', () => {
    mockDetectNativeInstallPromptSupport.mockReturnValue(true)

    renderWithProviders(<PwaInstallControl />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows the native install control when a deferred prompt is available', async () => {
    const promptInstall = vi.fn()
    mockUsePwaInstall.mockReturnValue({
      canInstall: true,
      isInstalling: false,
      promptInstall,
    })
    mockDetectNativeInstallPromptSupport.mockReturnValue(true)

    const user = userEvent.setup()
    renderWithProviders(<PwaInstallControl />)

    const installButton = screen.getByRole('button', { name: 'Install Agents Repo app' })
    expect(installButton).toHaveAttribute('title', 'Install app')

    await user.click(installButton)
    expect(promptInstall).toHaveBeenCalledOnce()
  })

  it('opens platform install guidance when native install is unavailable', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PwaInstallControl />)

    const howToButton = screen.getByRole('button', { name: 'How to install this site' })
    expect(howToButton).toHaveAttribute('title', 'How to install this site')

    await user.click(howToButton)

    expect(screen.getByRole('heading', { name: 'Install this site' })).toBeInTheDocument()
    expect(
      screen.getByText('Firefox on desktop cannot install this site as an app. See Using the catalog for other options.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Learn more about installing this site' })).toHaveAttribute(
      'href',
      publicSitePath(getDocDetailPath('using-the-catalog')),
    )
  })
})
