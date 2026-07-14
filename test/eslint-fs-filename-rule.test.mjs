/* eslint-disable sonarjs/no-os-command-from-path -- invokes repo-local eslint via execFileSync */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

const FS_FILENAME_RULE = 'security/detect-non-literal-fs-filename'
const repoRoot = resolve(import.meta.dirname, '..')

function runEslint(paths, { json = false } = {}) {
  const configPath = resolve(repoRoot, 'eslint.config.js')
  const args = ['--no-install', 'eslint', '--config', configPath]

  if (json) {
    args.push('--format', 'json')
  }

  args.push(...paths)

  return execFileSync('npx', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

function fsFilenameWarningsFromJson(output) {
  const results = JSON.parse(output)
  return results.flatMap((result) =>
    result.messages
      .filter((message) => message.ruleId === FS_FILENAME_RULE)
      .map((message) => ({ ...message, filePath: result.filePath })),
  )
}

function filePatterns(block) {
  if (!block.files) {
    return []
  }

  return Array.isArray(block.files) ? block.files : [block.files]
}

function targetsPathPrefix(block, prefix) {
  return filePatterns(block).some(
    (pattern) => typeof pattern === 'string' && pattern.startsWith(prefix),
  )
}

function fsFilenameRuleSetting(block) {
  return block.rules?.[FS_FILENAME_RULE]
}

function formatWarningLocations(warnings) {
  return warnings.map((warning) => `${warning.filePath}:${warning.line}`).join(', ')
}

describe('eslint fs-filename rule policy', () => {
  it('reports no fs-filename warnings under scripts/ and test/', () => {
    const output = runEslint(['scripts', 'test'], { json: true })
    const warnings = fsFilenameWarningsFromJson(output)

    assert.equal(
      warnings.length,
      0,
      `expected no ${FS_FILENAME_RULE} warnings, got: ${formatWarningLocations(warnings)}`,
    )
  })

  it('keeps fs-filename enabled for root-level js outside test/', () => {
    const fixturePath = resolve(repoRoot, '.eslint-fixture-dynamic-fs.mjs')

    writeFileSync(
      fixturePath,
      "import { readFileSync } from 'node:fs'\nreadFileSync(process.argv[2])\n",
    )

    try {
      const output = runEslint([fixturePath], { json: true })
      const warnings = fsFilenameWarningsFromJson(output)

      assert.ok(
        warnings.length > 0,
        `expected ${FS_FILENAME_RULE} warning for root-level dynamic fs fixture`,
      )
    } finally {
      unlinkSync(fixturePath)
    }
  })

  it('uses test/ override and documented per-script disables', async () => {
    const { default: eslintConfig } = await import('../eslint.config.js')
    const syncScript = readFileSync(resolve(repoRoot, 'scripts/sync-cursor-rules.mjs'), 'utf8')
    const pagesScript = readFileSync(resolve(repoRoot, 'scripts/prepare-pages-dist.mjs'), 'utf8')

    const testOverride = eslintConfig.some(
      (block) => targetsPathPrefix(block, 'test/') && fsFilenameRuleSetting(block) === 'off',
    )
    const scriptsOverride = eslintConfig.some(
      (block) => targetsPathPrefix(block, 'scripts/') && fsFilenameRuleSetting(block) === 'off',
    )

    assert.equal(testOverride, true, 'expected test/** fs-filename override')
    assert.equal(scriptsOverride, false, 'scripts/** must not disable fs-filename via config')
    assert.match(syncScript, /eslint-disable security\/detect-non-literal-fs-filename/)
    assert.match(pagesScript, /eslint-disable-next-line security\/detect-non-literal-fs-filename/)
  })
})
