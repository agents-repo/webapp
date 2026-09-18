import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import { brandLogoSvgRelativePath, JPEG_QUALITY, OG_HEIGHT, OG_WIDTH } from './constants.mjs'

/* eslint-disable security/detect-non-literal-fs-filename -- paths are repo-relative constants and @fontsource files */
const ogDir = path.dirname(fileURLToPath(import.meta.url))
export const ogScriptsRoot = ogDir
export const repoRoot = path.resolve(ogDir, '..', '..')

const LOGO_DISPLAY_PX = 48
const LOGO_RASTER_PX = LOGO_DISPLAY_PX * 2

const interFontDir = path.join(repoRoot, 'node_modules', '@fontsource', 'inter', 'files')

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

let fontsPromise
let logoDataUrlPromise

/**
 * @returns {Promise<string>} PNG data URL for the brand logo (Satori `img` src).
 */
export async function loadBrandLogoDataUrl() {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = (async () => {
      const logoPath = path.join(repoRoot, brandLogoSvgRelativePath)
      const svg = await fs.readFile(logoPath)
      const resvg = new Resvg(svg, {
        fitTo: { mode: 'width', value: LOGO_RASTER_PX },
      })
      const png = resvg.render().asPng()
      return `data:image/png;base64,${png.toString('base64')}`
    })()
  }
  return logoDataUrlPromise
}

async function getFonts() {
  if (!fontsPromise) {
    fontsPromise = loadFonts()
  }
  return fontsPromise
}

/**
 * @param {import('satori').SatoriNode} element
 * @returns {Promise<Buffer>} JPEG bytes for an OG card.
 */
export async function renderOgElementToJpeg(element) {
  const fonts = await getFonts()

  const svg = await satori(element, {
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

export { OG_HEIGHT, OG_WIDTH }
