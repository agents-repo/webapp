import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

const FS_FILENAME_RULE = 'security/detect-non-literal-fs-filename'
const repoRoot = resolve(import.meta.dirname, '..')

function runEslint(paths, { json = false } = {}) {
  const configPath = resolve(repoRoot, 'eslint.config.js')
  const formatFlag = json ? ' --format json' : ''
  const targetPaths = paths.map((entry) => `"${entry}"`).join(' ')
  return execSync(`npx eslint --config "${configPath}"${formatFlag} ${targetPaths}`, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

function fsFilenameWarningsFromJson(output) {
  const results = JSON.parse(output)
  return results.flatMap((result) =>
    result.messages.filter((message) => message.ruleId === FS_FILENAME_RULE),
  )
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

  it('uses test/ override and documented per-script disables', () => {
    const config = readFileSync(resolve(repoRoot, 'eslint.config.js'), 'utf8')
    const syncScript = readFileSync(resolve(repoRoot, 'scripts/sync-cursor-rules.mjs'), 'utf8')
    const pagesScript = readFileSync(resolve(repoRoot, 'scripts/prepare-pages-dist.mjs'), 'utf8')

    assert.match(config, /files:\s*\[\s*'test\/\*\*\/\*\.\{js,mjs,cjs\}'\s*\]/)
    assert.doesNotMatch(config, /files:\s*\[\s*'scripts\/\*\*\/\*\.\{js,mjs,cjs\}'/)
    assert.match(syncScript, /eslint-disable security\/detect-non-literal-fs-filename/)
    assert.match(pagesScript, /eslint-disable-next-line security\/detect-non-literal-fs-filename/)
  })
})
