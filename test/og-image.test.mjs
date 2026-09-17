import test from 'node:test'
import assert from 'node:assert/strict'
import { OG_HEIGHT, OG_WIDTH } from '../scripts/og/constants.mjs'

test('OG constants match siteSeo dimensions', () => {
  assert.equal(OG_WIDTH, 1200)
  assert.equal(OG_HEIGHT, 630)
})
