import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const EXTRACT_DIRS = [
  '.github/agents',
  '.cursor/skills',
  '.claude/agents',
  '.agents/skills',
]

export const MAX_ATTEMPTS = 3
export const RETRY_BASE_MS = 2_000

export function isRetryableAgentsCiOutput(output) {
  return output.includes('[registry_fetch_error]')
}

export function retryDelayMs(attempt) {
  return RETRY_BASE_MS * 2 ** (attempt - 1)
}

export function cleanExtractDirs(repoRoot, rmFn = fs.rmSync) {
  for (const relativePath of EXTRACT_DIRS) {
    rmFn(path.join(repoRoot, relativePath), { recursive: true, force: true })
  }
}

export function createAgentsRepoCiRunner(repoRoot = REPO_ROOT, env = process.env) {
  const cliEntry = path.join(repoRoot, 'node_modules', 'agents-repo', 'dist', 'bin', 'agents-repo.js')

  return () =>
    new Promise((resolve) => {
      const child = spawn(process.execPath, [cliEntry, 'ci'], {
        cwd: repoRoot,
        env,
      })
      let output = ''

      const append = (chunk) => {
        const text = chunk.toString()
        output += text
        return text
      }

      child.stdout.on('data', (chunk) => {
        process.stdout.write(append(chunk))
      })
      child.stderr.on('data', (chunk) => {
        process.stderr.write(append(chunk))
      })
      child.on('error', (error) => {
        resolve({ code: 1, output: error instanceof Error ? error.message : String(error) })
      })
      child.on('exit', (code) => {
        resolve({ code: code ?? 1, output })
      })
    })
}

export async function runAgentsCiWithRetry(options) {
  const {
    repoRoot,
    maxAttempts = MAX_ATTEMPTS,
    runCi,
    clean = cleanExtractDirs,
    sleep = (ms) =>
      new Promise((resolve) => {
        setTimeout(resolve, ms)
      }),
    log = console.warn,
  } = options

  let lastResult = { code: 1, output: '' }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    clean(repoRoot)
    lastResult = await runCi()
    if (lastResult.code === 0) {
      return lastResult
    }

    const canRetry = isRetryableAgentsCiOutput(lastResult.output) && attempt < maxAttempts
    if (!canRetry) {
      return lastResult
    }

    const delayMs = retryDelayMs(attempt)
    log(
      `agents:ci attempt ${attempt}/${maxAttempts} failed with a retryable registry fetch error; retrying in ${delayMs}ms.`,
    )
    await sleep(delayMs)
  }

  return lastResult
}

const isDirectRun = process.argv[1] !== undefined && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url

if (isDirectRun) {
  const result = await runAgentsCiWithRetry({
    repoRoot: REPO_ROOT,
    runCi: createAgentsRepoCiRunner(REPO_ROOT),
  })
  process.exit(result.code)
}
