import { describe, expect, it } from 'vitest'
import { INSTALL_TARGET_IDS } from '../domain/package'
import {
  PLATFORM_INSTALL_TARGETS,
  buildCliInitCommand,
  buildCliInstallCommand,
  getCliInitPlaceholderCommand,
  getCliInstallPopoverIntro,
} from './cliInstallCopy'

describe('cliInstallCopy', () => {
  it('buildCliInstallCommand trims package id', () => {
    expect(buildCliInstallCommand('  agents-repo/sample-agent  ')).toBe(
      'npx agents-repo install agents-repo/sample-agent',
    )
  })

  it('buildCliInitCommand formats each platform target', () => {
    for (const targetId of INSTALL_TARGET_IDS) {
      expect(buildCliInitCommand(targetId)).toBe(`npx agents-repo init --targets ${targetId}`)
    }
  })

  it('exposes stable platform target order', () => {
    expect(PLATFORM_INSTALL_TARGETS).toEqual([...INSTALL_TARGET_IDS])
  })

  it('provides init placeholder without a target id', () => {
    expect(getCliInitPlaceholderCommand()).toBe('npx agents-repo init --targets')
  })

  it('provides popover intro copy', () => {
    expect(getCliInstallPopoverIntro().length).toBeGreaterThan(20)
  })
})
