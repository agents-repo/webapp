import { INSTALL_TARGET_IDS, type InstallTargetId } from '../domain/package'

export const PLATFORM_INSTALL_TARGETS: readonly InstallTargetId[] = INSTALL_TARGET_IDS

export const shellSingleQuote = (value: string): string => {
  return `'${value.replace(/'/g, "'\\''")}'`
}

export const buildCliInstallCommand = (packageRef: string): string => {
  const trimmed = packageRef.trim()
  return `npx agents-repo install ${shellSingleQuote(trimmed)}`
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
