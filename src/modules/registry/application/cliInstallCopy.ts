import { INSTALL_TARGET_IDS, type InstallTargetId } from '../domain/package'

export const PLATFORM_INSTALL_TARGETS: readonly InstallTargetId[] = INSTALL_TARGET_IDS

const shellEmbeddedSingleQuote = String.raw`'\''`

/** Shell-safe package refs (registry ids) are shown unquoted per issue #148. */
const UNQUOTED_PACKAGE_REF_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/

export const shellSingleQuote = (value: string): string => {
  return `'${value.replaceAll("'", shellEmbeddedSingleQuote)}'`
}

export const buildCliInstallCommand = (packageRef: string): string => {
  const trimmed = packageRef.trim()
  const packageRefToken = UNQUOTED_PACKAGE_REF_PATTERN.test(trimmed)
    ? trimmed
    : shellSingleQuote(trimmed)
  return `npx agents-repo install ${packageRefToken}`
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
