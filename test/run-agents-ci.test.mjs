import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  EXTRACT_DIRS,
  MAX_ATTEMPTS,
  RETRY_BASE_MS,
  cleanExtractDirs,
  isRetryableAgentsCiOutput,
  retryDelayMs,
  runAgentsCiWithRetry,
} from '../scripts/run-agents-ci.mjs';

const FAKE_REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fake-agents-ci-root');

describe('run-agents-ci retry policy', () => {
  it('retries CLI registry fetch errors including HTTP 522', () => {
    assert.equal(
      isRetryableAgentsCiOutput('[registry_fetch_error] Artifact download failed (522 <none>)'),
      true,
    );
  });

  it('does not retry lock drift or other non-fetch failures', () => {
    assert.equal(isRetryableAgentsCiOutput('lock_config_package_drift'), false);
    assert.equal(isRetryableAgentsCiOutput(''), false);
  });

  it('uses exponential backoff from the shared base delay', () => {
    assert.equal(retryDelayMs(1), RETRY_BASE_MS);
    assert.equal(retryDelayMs(2), RETRY_BASE_MS * 2);
    assert.equal(retryDelayMs(3), RETRY_BASE_MS * 4);
  });

  it('cleans each extract directory under the repo root', () => {
    const removed = [];
    cleanExtractDirs(FAKE_REPO_ROOT, (target, options) => {
      removed.push({ target, options });
    });

    assert.deepEqual(
      removed.map((entry) => entry.target),
      EXTRACT_DIRS.map((relativePath) => path.join(FAKE_REPO_ROOT, relativePath)),
    );
    assert.ok(removed.every((entry) => entry.options.recursive && entry.options.force));
  });

  it('retries a registry fetch error then succeeds', async () => {
    const cleaned = [];
    const sleeps = [];
    const logs = [];
    let calls = 0;

    const result = await runAgentsCiWithRetry({
      repoRoot: FAKE_REPO_ROOT,
      clean: (root) => {
        cleaned.push(root);
      },
      sleep: async (ms) => {
        sleeps.push(ms);
      },
      log: (message) => {
        logs.push(message);
      },
      runCi: async () => {
        calls += 1;
        if (calls === 1) {
          return {
            code: 1,
            output: '[registry_fetch_error] Artifact download failed (522 <none>)',
          };
        }
        return { code: 0, output: '' };
      },
    });

    assert.equal(result.code, 0);
    assert.equal(calls, 2);
    assert.equal(cleaned.length, 2);
    assert.deepEqual(sleeps, [RETRY_BASE_MS]);
    assert.match(logs[0], /attempt 1\/3/);
  });

  it('fails immediately on non-retryable errors', async () => {
    let calls = 0;

    const result = await runAgentsCiWithRetry({
      repoRoot: FAKE_REPO_ROOT,
      clean: () => undefined,
      sleep: async () => {
        throw new Error('should not sleep');
      },
      runCi: async () => {
        calls += 1;
        return { code: 3, output: 'lock_config_package_drift' };
      },
    });

    assert.equal(result.code, 3);
    assert.equal(calls, 1);
  });

  it('stops after the maximum retryable attempts', async () => {
    let calls = 0;

    const result = await runAgentsCiWithRetry({
      repoRoot: FAKE_REPO_ROOT,
      maxAttempts: MAX_ATTEMPTS,
      clean: () => undefined,
      sleep: async () => undefined,
      log: () => undefined,
      runCi: async () => {
        calls += 1;
        return {
          code: 1,
          output: '[registry_fetch_error] Artifact download failed (522 <none>)',
        };
      },
    });

    assert.equal(result.code, 1);
    assert.equal(calls, MAX_ATTEMPTS);
  });
});
