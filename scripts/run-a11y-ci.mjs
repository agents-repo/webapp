/* eslint-disable sonarjs/no-os-command-from-path */
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { resolveChromeExecutable } from './resolve-chrome-executable.mjs'

const serverPort = 4173
const serverReadyPattern = /Accepting connections/

function runCommand(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env,
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}`))
    })
  })
}

async function waitForServerReady(child) {
  await new Promise((resolve, reject) => {
    let output = ''

    const onData = (chunk) => {
      output += chunk.toString()
      if (serverReadyPattern.test(output)) {
        cleanup()
        resolve()
      }
    }

    const onExit = (code) => {
      cleanup()
      reject(new Error(`Static server exited before becoming ready (code ${code ?? 'unknown'})`))
    }

    const cleanup = () => {
      child.stdout?.off('data', onData)
      child.stderr?.off('data', onData)
      child.off('exit', onExit)
    }

    child.stdout?.on('data', onData)
    child.stderr?.on('data', onData)
    child.on('exit', onExit)
  })

  await delay(1500)
}

async function stopServer(server) {
  server.kill('SIGTERM')
  await delay(500)
  if (!server.killed) {
    server.kill('SIGKILL')
  }
}

async function runWithRetry(command, args, retries = 2, env = process.env) {
  let lastError

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      await runCommand(command, args, env)
      return
    } catch (error) {
      lastError = error
      if (attempt < retries) {
        await delay(2000)
      }
    }
  }

  throw lastError
}

async function main() {
  const chromeExecutable = resolveChromeExecutable()
  const pa11yEnv = { ...process.env }

  if (chromeExecutable) {
    pa11yEnv.PUPPETEER_EXECUTABLE_PATH = chromeExecutable
    pa11yEnv.CHROME_PATH = chromeExecutable
  }

  const server = spawn('npx', ['serve', '-s', 'dist', '-l', String(serverPort)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  })

  try {
    await waitForServerReady(server)
    await runWithRetry('npx', ['lhci', 'autorun'])
    await runCommand('npx', ['pa11y-ci'], pa11yEnv)
  } finally {
    await stopServer(server)
  }
}

await main()
