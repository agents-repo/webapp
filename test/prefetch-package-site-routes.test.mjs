import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadProductionCatalog, resolveProductionIndexUrl } from '../scripts/prefetch-package-site-routes-lib.mjs'

describe('prefetch package site routes', () => {
  it('fails the production catalog load when the index fetch fails', async () => {
    const fetchImpl = async () => ({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    })

    await assert.rejects(
      () => loadProductionCatalog('https://example.test/packages/index.json', fetchImpl),
      /Failed to fetch registry index for package sitemap routes \(503 Service Unavailable\)/,
    )
  })

  it('fails the production catalog load when the payload is not a catalog', async () => {
    const fetchImpl = async () => ({
      ok: true,
      json: async () => ({ not: 'a catalog' }),
    })

    await assert.rejects(
      () => loadProductionCatalog('https://example.test/packages/index.json', fetchImpl),
      /does not match the expected catalog schema/,
    )
  })

  it('resolves a v2.x alias to a concrete tag before fetching the index', async () => {
    const indexUrl = await resolveProductionIndexUrl('production', {
      loadEnv: () => ({}),
    })

    assert.match(indexUrl, /[?&]ref=v2\.\d+\.\d+(?:&|$)/)
    assert.doesNotMatch(indexUrl, /[?&]ref=v2\.x(?:&|$)/)
  })
})
