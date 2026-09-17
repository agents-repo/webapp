import test from 'node:test';
import assert from 'node:assert/strict';
import {
  collectChangedPaths,
  matchPathGroups,
  pathMatches,
} from '../scripts/ci-pr-path-filters.mjs';

test('package-lock.json turns slides and pages on and agents off', () => {
  const matches = matchPathGroups(['package-lock.json']);
  assert.equal(matches.slides, true);
  assert.equal(matches.pages, true);
  assert.equal(matches.agents, false);
});

test('package.json turns slides and pages on and agents off', () => {
  const matches = matchPathGroups(['package.json']);
  assert.equal(matches.slides, true);
  assert.equal(matches.pages, true);
  assert.equal(matches.agents, false);
});

test('agents.json turns checksum on', () => {
  const matches = matchPathGroups(['agents.json']);
  assert.equal(matches.agents, true);
  assert.equal(matches.slides, false);
  assert.equal(matches.pages, false);
});

test('docs-only README turns no extras on', () => {
  const matches = matchPathGroups(['README.md']);
  assert.equal(matches.slides, false);
  assert.equal(matches.agents, false);
  assert.equal(matches.pages, false);
  assert.equal(matches.cliDocs, false);
});

test('eslint.config.js-only does not turn pages on', () => {
  const matches = matchPathGroups(['eslint.config.js']);
  assert.equal(matches.pages, false);
  assert.equal(matches.slides, false);
  assert.equal(matches.agents, false);
});

test('src change turns pages on without slides, agents, or cliDocs', () => {
  const matches = matchPathGroups(['src/App.tsx']);
  assert.equal(matches.pages, true);
  assert.equal(matches.slides, false);
  assert.equal(matches.agents, false);
  assert.equal(matches.cliDocs, false);
});

test('cli-commands.md turns cliDocs and pages on', () => {
  const matches = matchPathGroups(['src/content/docs/es/cli-commands.md']);
  assert.equal(matches.cliDocs, true);
  assert.equal(matches.pages, true);
  assert.equal(matches.slides, false);
  assert.equal(matches.agents, false);
});

test('unrelated test files do not turn pages on', () => {
  const matches = matchPathGroups(['test/commit-analyzer-rules.test.mjs']);
  assert.equal(matches.pages, false);
});

test('crawl integration tests turn pages on', () => {
  const matches = matchPathGroups(['test/crawl-files.integration.test.mjs']);
  assert.equal(matches.pages, true);
  const pwa = matchPathGroups(['test/pwa-sw.integration.test.mjs']);
  assert.equal(pwa.pages, true);
});

test('scripts/slides.mjs turns slides on and pages off', () => {
  const matches = matchPathGroups(['scripts/slides.mjs']);
  assert.equal(matches.slides, true);
  assert.equal(matches.pages, false);
});

test('matcher script turns every extra this job defines on', () => {
  const matches = matchPathGroups(['scripts/ci-pr-path-filters.mjs']);
  assert.equal(matches.slides, true);
  assert.equal(matches.og, true);
  assert.equal(matches.agents, true);
  assert.equal(matches.pages, true);
  assert.equal(matches.cliDocs, true);
});

test('scripts/og-image.mjs turns og on and pages off', () => {
  const matches = matchPathGroups(['scripts/og-image.mjs']);
  assert.equal(matches.og, true);
  assert.equal(matches.pages, false);
});

test('public/og-image.jpg turns og and pages on', () => {
  const matches = matchPathGroups(['public/og-image.jpg']);
  assert.equal(matches.og, true);
  assert.equal(matches.pages, true);
});

test('pr-baseline.yml turns every extra this job defines on', () => {
  const matches = matchPathGroups(['.github/workflows/pr-baseline.yml']);
  assert.equal(matches.slides, true);
  assert.equal(matches.og, true);
  assert.equal(matches.agents, true);
  assert.equal(matches.pages, true);
  assert.equal(matches.cliDocs, true);
});

test('rename previous_filename is collected for matching', () => {
  const paths = collectChangedPaths([
    { filename: 'src/New.tsx', previous_filename: 'docs/slides/old.md' },
  ]);
  const matches = matchPathGroups(paths);
  assert.equal(matches.pages, true);
  assert.equal(matches.slides, true);
});

test('tsconfig glob matches nested names without slashes', () => {
  assert.equal(pathMatches('tsconfig*.json', 'tsconfig.app.json'), true);
  assert.equal(pathMatches('tsconfig*.json', 'tsconfig.json'), true);
  assert.equal(pathMatches('tsconfig*.json', 'nested/tsconfig.json'), false);
});
