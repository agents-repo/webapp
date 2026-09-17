import {
  PLATFORM_INSTALL_TARGETS,
  buildCliInitCommand,
  buildCliInstallCommand,
} from '../../../application/cliInstallCopy'

export const FEATURED_PACKAGE_NAMESPACE = 'agents-repo'
export const FEATURED_PACKAGE_ID = 'hello-agent'
export const FEATURED_PACKAGE_REF = `${FEATURED_PACKAGE_NAMESPACE}/${FEATURED_PACKAGE_ID}`

export const CLI_QUICKSTART_ID = 'cli-quickstart'

export const CLI_INIT_COMMAND = buildCliInitCommand(PLATFORM_INSTALL_TARGETS)

export const CLI_INSTALL_COMMAND = buildCliInstallCommand(FEATURED_PACKAGE_REF)
