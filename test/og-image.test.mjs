import test from 'node:test'
import assert from 'node:assert/strict'
import { OG_HEIGHT, OG_WIDTH } from '../scripts/og/constants.mjs'
import { ogImageHeight, ogImageWidth } from '../src/modules/site/application/seo/siteSeo.ts'

test('OG constants match siteSeo dimensions', () => {
  assert.equal(OG_WIDTH, ogImageWidth)
  assert.equal(OG_HEIGHT, ogImageHeight)
  assert.equal(ogImageWidth, 1200)
  assert.equal(ogImageHeight, 630)
})
