import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import {
  resolveBuildSiteOrigin,
  resolveViteSiteUrl,
} from '../scripts/seo-build-config.ts'

const productionOrigin = 'https://agents-repo.org'
const previewTestOrigin = 'https://preview.example.test'

describe('seo-build-config', () => {
  afterEach(() => {
    delete process.env.VITE_SITE_URL
  })

  it('resolves production origin from .env.production', () => {
    assert.equal(resolveBuildSiteOrigin('production'), productionOrigin)
    assert.equal(resolveViteSiteUrl('production'), productionOrigin)
  })

  it('prefers shell VITE_SITE_URL over env files', () => {
    process.env.VITE_SITE_URL = previewTestOrigin

    assert.equal(resolveViteSiteUrl('production'), previewTestOrigin)
    assert.equal(resolveBuildSiteOrigin('production'), previewTestOrigin)
  })

  it('strips trailing slashes from the resolved origin', () => {
    process.env.VITE_SITE_URL = 'https://example.test/'

    assert.equal(resolveBuildSiteOrigin('production'), 'https://example.test')
  })

  it('falls back to the default origin when no env value is set', () => {
    assert.equal(resolveBuildSiteOrigin('no-env-file-mode'), productionOrigin)
    assert.equal(resolveViteSiteUrl('no-env-file-mode'), undefined)
  })
})
