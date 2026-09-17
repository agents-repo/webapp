/** Keep width/height aligned with `src/modules/site/application/seo/siteSeo.ts`. */
export const OG_WIDTH = 1200
export const OG_HEIGHT = 630

/** Social crawlers can reject large cards; tune with `og:generate` and unfurl smoke tests. */
export const MAX_JPEG_BYTES = 300 * 1024

export const JPEG_QUALITY = 82

/** Same asset as site header / home hero (`Header.tsx`, `HomeHeroSection.tsx`). */
export const brandLogoSvgRelativePath = 'src/assets/logo/agents-repo-logo.svg'

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

/** Dark social-preview card (committed OG JPEG). */
export const ogDark = {
  bg: '#090D16',
  text: '#F3F4F6',
  muted: '#9CA3AF',
  subtle: '#6B7280',
  pillText: '#E5E7EB',
  accentPurple: 'rgba(138, 42, 216, 0.25)',
  accentIndigo: 'rgba(67, 56, 202, 0.15)',
  pillBg: 'rgba(255, 255, 255, 0.04)',
  pillBorder: 'rgba(255, 255, 255, 0.08)',
}
