import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import * as sass from 'sass'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const themePath = join(repoRoot, 'src/styles/bootstrap-theme.scss')

function srgbToLin(channel) {
  const s = channel / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminance(rgb) {
  return 0.2126 * srgbToLin(rgb[0]) + 0.7152 * srgbToLin(rgb[1]) + 0.0722 * srgbToLin(rgb[2])
}

function contrastRatio(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background))
  const darker = Math.min(luminance(foreground), luminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

function parseCssColor(value) {
  const trimmed = value.trim()
  if (trimmed.startsWith('#') && trimmed.length === 7) {
    const n = Number.parseInt(trimmed.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }

  if (trimmed.startsWith('rgb')) {
    const open = trimmed.indexOf('(')
    const close = trimmed.indexOf(')')
    const parts = trimmed
      .slice(open + 1, close)
      .split(/[\s,/]+/)
      .filter((part) => part.length > 0)
    return [Number(parts[0]), Number(parts[1]), Number(parts[2])]
  }

  throw new Error(`Unsupported color: ${value}`)
}

function parseColorDeclarations(block) {
  const colors = new Map()

  for (const declaration of block.split(';')) {
    const trimmed = declaration.trim()
    if (trimmed.length === 0) {
      continue
    }

    const colon = trimmed.indexOf(':')
    colors.set(trimmed.slice(0, colon).trim(), parseCssColor(trimmed.slice(colon + 1)))
  }

  return colors
}

function parseProbeColors(css) {
  const start = css.indexOf('#contrast-probe')
  assert.ok(start >= 0, 'missing #contrast-probe')
  const open = css.indexOf('{', start)
  const close = css.indexOf('}', open)
  return parseColorDeclarations(css.slice(open + 1, close))
}

function parseScopedRuleColors(css, selectorRegex, missingMessage) {
  const match = css.match(selectorRegex)
  assert.ok(match, missingMessage)
  const open = match[0].indexOf('{')
  const close = match[0].lastIndexOf('}')
  return parseColorDeclarations(match[0].slice(open + 1, close))
}

function composite(foreground, alpha, background) {
  return foreground.map((channel, index) => channel * alpha + background[index] * (1 - alpha))
}

describe('dark-mode contrast tokens', () => {
  const compiled = sass.compileString(
    `${readFileSync(themePath, 'utf8')}
#contrast-probe {
  --probe-link: #{$link-color-dark};
  --probe-emphasis: #{$primary-text-emphasis-dark};
  --probe-secondary-emphasis: #{$secondary-text-emphasis-dark};
  --probe-navbar-active: #{$navbar-dark-active-color};
  --probe-primary: #{$primary};
  --probe-body-bg-dark: #{$body-bg-dark};
  --probe-body-bg-light: #{$body-bg};
  --probe-body-color-dark: #{$body-color-dark};
  --probe-card-bg: #{$card-bg-dark};
  --probe-tertiary-bg: #{$body-tertiary-bg-dark};
  --probe-primary-bg-subtle: #{$primary-bg-subtle-dark};
}
`,
    {
      loadPaths: [repoRoot, join(repoRoot, 'node_modules')],
      silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
    },
  )

  const probeColors = parseProbeColors(compiled.css)

  function probe(customProperty) {
    const color = probeColors.get(customProperty)
    assert.ok(color, `missing contrast probe ${customProperty}`)
    return color
  }

  const bodyBg = probe('--probe-body-bg-dark')
  const cardBg = probe('--probe-card-bg')
  // Matches [data-bs-theme="dark"] .card --bs-card-cap-bg in bootstrap-theme.scss.
  const cardCap = composite([255, 255, 255], 0.04, cardBg)
  const footerTertiary = probe('--probe-tertiary-bg')
  // Matches .app-navbar background-color in App.scss (not a Sass token).
  const navbarOpaque = [19, 15, 27]
  const navbarOverLight = composite(navbarOpaque, 0.88, probe('--probe-body-bg-light'))
  const bodyColorDark = probe('--probe-body-color-dark')

  it('does not use untinted primary for dark links or navbar active', () => {
    const primary = probe('--probe-primary')
    const link = probe('--probe-link')
    const navbarActive = probe('--probe-navbar-active')

    assert.notDeepEqual(link, primary)
    assert.notDeepEqual(navbarActive, primary)
    assert.deepEqual(navbarActive, link)
    assert.deepEqual(probe('--probe-emphasis'), link)
  })

  it('keeps filled primary contrast for white text', () => {
    assert.ok(contrastRatio([255, 255, 255], probe('--probe-primary')) >= 4.5)
  })

  it('meets WCAG 2.2 AA for dark-mode links and outline rest colors', () => {
    const link = probe('--probe-link')
    const secondary = probe('--probe-secondary-emphasis')
    const surfaces = [
      ['body', bodyBg],
      ['card', cardBg],
      ['card footer', cardCap],
      ['footer tertiary', footerTertiary],
    ]

    for (const [name, background] of surfaces) {
      const linkRatio = contrastRatio(link, background)
      const secondaryRatio = contrastRatio(secondary, background)
      assert.ok(linkRatio >= 4.5, `${name} link contrast ${linkRatio.toFixed(2)}`)
      assert.ok(
        secondaryRatio >= 4.5,
        `${name} outline-secondary contrast ${secondaryRatio.toFixed(2)}`,
      )
    }
  })

  it('meets WCAG 2.2 AA for docs sidebar current page on primary subtle', () => {
    const ratio = contrastRatio(probe('--probe-emphasis'), probe('--probe-primary-bg-subtle'))
    assert.ok(ratio >= 4.5, `docs current page contrast ${ratio.toFixed(2)}`)
  })

  it('makes header current page at least as readable as inactive nav', () => {
    const inactive = composite(composite(bodyColorDark, 0.88, navbarOpaque), 0.88, navbarOpaque)
    const active = probe('--probe-navbar-active')
    const activeOnDarkBar = contrastRatio(active, navbarOpaque)
    const inactiveOnDarkBar = contrastRatio(inactive, navbarOpaque)

    assert.ok(activeOnDarkBar >= 4.5, `active on dark bar ${activeOnDarkBar.toFixed(2)}`)
    assert.ok(
      activeOnDarkBar + 0.05 >= inactiveOnDarkBar,
      `active ${activeOnDarkBar.toFixed(2)} vs inactive ${inactiveOnDarkBar.toFixed(2)}`,
    )
    assert.ok(
      contrastRatio(active, navbarOverLight) >= 4.5,
      `active on light-page bar ${contrastRatio(active, navbarOverLight).toFixed(2)}`,
    )
  })

  it('overrides dark outline button tokens in compiled CSS', () => {
    // Bootstrap emits .btn-outline-* after the first [data-bs-theme=dark] root
    // block. Match the scoped override, not a substring of that later base class.
    const primaryRule = parseScopedRuleColors(
      compiled.css,
      /\[data-bs-theme=(?:"dark"|dark)\]\s*\.btn-outline-primary\s*\{[^}]+\}/,
      'missing dark-theme .btn-outline-primary override',
    )
    const secondaryRule = parseScopedRuleColors(
      compiled.css,
      /\[data-bs-theme=(?:"dark"|dark)\]\s*\.btn-outline-secondary\s*\{[^}]+\}/,
      'missing dark-theme .btn-outline-secondary override',
    )
    const link = probe('--probe-link')
    const secondary = probe('--probe-secondary-emphasis')

    for (const property of [
      '--bs-btn-color',
      '--bs-btn-border-color',
      '--bs-btn-disabled-color',
      '--bs-btn-disabled-border-color',
    ]) {
      assert.deepEqual(primaryRule.get(property), link, `outline-primary ${property}`)
      assert.deepEqual(secondaryRule.get(property), secondary, `outline-secondary ${property}`)
    }
  })
})
