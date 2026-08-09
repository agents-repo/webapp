import { INSTALL_TARGET_IDS, type InstallTargetId } from '../domain/package'

export const PLATFORM_INSTALL_TARGETS: readonly InstallTargetId[] = INSTALL_TARGET_IDS

export const buildCliInstallCommand = (packageId: string): string => {
  return `npx agents-repo install ${packageId.trim()}`
}

export const buildCliInitCommand = (targetId: InstallTargetId): string => {
  return `npx agents-repo init --targets ${targetId}`
}

export const getCliInitPlaceholderCommand = (): string => {
  return 'npx agents-repo init --targets'
}

export const getCliInstallPopoverIntro = (): string => {
  return 'Select an AI tool, then run the init command in your project root. After that, install the package with the command below.'
}
