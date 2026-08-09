import { INSTALL_TARGET_IDS, type InstallTargetId } from '../domain/package'

export const PLATFORM_INSTALL_TARGETS: readonly InstallTargetId[] = INSTALL_TARGET_IDS

const shellEmbeddedSingleQuote = String.raw`'\''`

export const shellSingleQuote = (value: string): string => {
  return `'${value.replaceAll("'", shellEmbeddedSingleQuote)}'`
}

export const buildCliInstallCommand = (packageRef: string): string => {
  const trimmed = packageRef.trim()
  return `npx agents-repo install ${shellSingleQuote(trimmed)}`
}

export const buildCliInitCommand = (targetIds: readonly InstallTargetId[]): string => {
  const selected = new Set(targetIds)
  const orderedTargets = PLATFORM_INSTALL_TARGETS.filter((targetId) => selected.has(targetId))
  return `npx agents-repo init --targets ${orderedTargets.join(' ')}`
}

export const getCliInitPlaceholderCommand = (): string => {
  return 'npx agents-repo init --targets'
}

export const getCliInstallPopoverIntro = (): string => {
  return 'Select one or more AI tools, then run the init command in your project root. After that, install the package with the command below.'
}
