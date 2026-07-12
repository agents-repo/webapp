import { test, expect } from '@playwright/test'

const e2ePreviewBaseUrl = 'http://127.0.0.1:4173'

const missingE2eBuildMessage = [
  'Port 4173 is not serving an e2e build (missing /e2e-build-marker.json).',
  'Stop any existing preview on port 4173 (npm run preview, a11y:ci, etc.)',
  'and run npm run test:e2e again.',
  'To reuse a server intentionally, start it with npm run build:pages:e2e && npm run preview',
  'and set PLAYWRIGHT_REUSE_SERVER=true.',
].join(' ')

const invalidE2eBuildMessage = [
  'Port 4173 is not serving an e2e build (invalid /e2e-build-marker.json).',
  'Stop any existing preview on port 4173 and run npm run test:e2e again,',
  'or start the correct server with npm run build:pages:e2e && npm run preview',
  'and set PLAYWRIGHT_REUSE_SERVER=true.',
].join(' ')

test('preview serves e2e build marker', async ({ request }) => {
  const response = await request.get(`${e2ePreviewBaseUrl}/e2e-build-marker.json`)

  await expect(response, missingE2eBuildMessage).toBeOK()

  const contentType = response.headers()['content-type'] ?? ''
  expect(contentType.includes('application/json'), invalidE2eBuildMessage).toBe(true)

  const body: unknown = await response.json()

  expect(body, invalidE2eBuildMessage).toEqual({ e2e: true })
})
