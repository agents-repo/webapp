import {
  PLATFORM_INSTALL_TARGETS,
  buildCliInitCommand,
  buildCliInstallCommand,
} from '../../../application/cliInstallCopy'

export const HOME_HERO_HEADING =
  'Ready-to-use agents and flows for Copilot, Cursor, Claude Code, and Codex'

export const CLI_QUICKSTART_ID = 'cli-quickstart'

export const CLI_INIT_COMMAND = buildCliInitCommand(PLATFORM_INSTALL_TARGETS)

export const CLI_INSTALL_COMMAND = buildCliInstallCommand('agents-repo/some-package')
