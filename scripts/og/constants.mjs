/** Keep width/height aligned with `src/modules/site/application/seo/siteSeo.ts`. */
export const OG_WIDTH = 1200
export const OG_HEIGHT = 630

/** Social crawlers can reject large cards; tune with `og:generate` and unfurl smoke tests. */
export const MAX_JPEG_BYTES = 300 * 1024

export const JPEG_QUALITY = 82

/** Bootstrap theme tokens from `src/styles/bootstrap-theme.scss` (Satori inline styles). */
export const theme = {
  primary: '#8a2ad8',
  secondary: '#6e5a89',
  bodyBg: '#fbf8ff',
  bodyColor: '#221833',
  headingColor: '#1d132a',
  borderColor: '#e3d7f3',
  cardBg: '#ffffff',
}
