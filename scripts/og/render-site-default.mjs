import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import { createSiteDefaultOgElement } from './site-default-card.mjs'
import { JPEG_QUALITY, OG_HEIGHT, OG_WIDTH } from './constants.mjs'

const ogDir = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(ogDir, '..', '..')

const interRegularPath = path.join(
  root,
  'node_modules',
  '@fontsource',
  'inter',
  'files',
  'inter-latin-400-normal.woff',
)
const interBoldPath = path.join(
  root,
  'node_modules',
  '@fontsource',
  'inter',
  'files',
  'inter-latin-700-normal.woff',
)

async function loadFonts() {
  return Promise.all([fs.readFile(interRegularPath), fs.readFile(interBoldPath)])
}

/**
 * @returns {Promise<Buffer>} JPEG bytes for the site default OG card.
 */
export async function renderSiteDefaultOgJpeg() {
  const [regular, bold] = await loadFonts()

  const svg = await satori(createSiteDefaultOgElement(), {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      {
        name: 'Inter',
        data: regular,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: bold,
        weight: 700,
        style: 'normal',
      },
    ],
  })

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: OG_WIDTH },
  })
  const png = resvg.render().asPng()

  return sharp(png)
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer()
}
