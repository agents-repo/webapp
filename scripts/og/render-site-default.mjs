import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import { createSiteDefaultOgElement } from './site-default-card.mjs'
import { brandLogoSvgRelativePath, JPEG_QUALITY, OG_HEIGHT, OG_WIDTH } from './constants.mjs'

/* eslint-disable security/detect-non-literal-fs-filename -- paths are repo-relative constants and @fontsource files */
const ogDir = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(ogDir, '..', '..')

const LOGO_DISPLAY_PX = 48
const LOGO_RASTER_PX = LOGO_DISPLAY_PX * 2

const interFontDir = path.join(root, 'node_modules', '@fontsource', 'inter', 'files')

const interFontPaths = {
  400: path.join(interFontDir, 'inter-latin-400-normal.woff'),
  500: path.join(interFontDir, 'inter-latin-500-normal.woff'),
  600: path.join(interFontDir, 'inter-latin-600-normal.woff'),
  700: path.join(interFontDir, 'inter-latin-700-normal.woff'),
  800: path.join(interFontDir, 'inter-latin-800-normal.woff'),
}

async function loadFonts() {
  const weights = [400, 500, 600, 700, 800]
  const buffers = await Promise.all(weights.map((weight) => fs.readFile(interFontPaths[weight])))
  return weights.map((weight, index) => ({
    name: 'Inter',
    data: buffers[index],
    weight,
    style: 'normal',
  }))
}

/**
 * @returns {Promise<string>} PNG data URL for the brand logo (Satori `img` src).
 */
export async function loadBrandLogoDataUrl() {
  const logoPath = path.join(root, brandLogoSvgRelativePath)
  const svg = await fs.readFile(logoPath)
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: LOGO_RASTER_PX },
  })
  const png = resvg.render().asPng()
  return `data:image/png;base64,${png.toString('base64')}`
}

/**
 * @returns {Promise<Buffer>} JPEG bytes for the site default OG card.
 */
export async function renderSiteDefaultOgJpeg() {
  const [fonts, logoDataUrl] = await Promise.all([loadFonts(), loadBrandLogoDataUrl()])

  const svg = await satori(createSiteDefaultOgElement({ logoDataUrl }), {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  })

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: OG_WIDTH },
  })
  const png = resvg.render().asPng()

  return sharp(png)
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer()
}
