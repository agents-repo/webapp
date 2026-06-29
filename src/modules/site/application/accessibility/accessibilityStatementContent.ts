export const accessibilityStatementReportDate = '2026-06-29'

export const accessibilityConformanceSummary = {
  productName: 'Agents Repo web application',
  reportVersion: '1.0',
  wcagVersion: 'WCAG 2.2',
  conformanceTarget: 'Level AA',
  conformanceStatus: 'Partially conformant',
  conformanceStatusDescription:
    'The Agents Repo web application partially conforms to WCAG 2.2 Level AA. Some content depends on external registry data and third-party sites that are outside the scope of this report.',
} as const

export interface WcagCriterionSummary {
  readonly principle: string
  readonly supportLevel: 'Supports' | 'Partially supports' | 'Does not support' | 'Not applicable'
  readonly notes: string
}

export const wcagCriterionSummaries: readonly WcagCriterionSummary[] = [
  {
    principle: 'Perceivable',
    supportLevel: 'Partially supports',
    notes:
      'Semantic structure, text alternatives for decorative icons, light and dark themes, and skip navigation are provided. Color contrast is validated in CI but may vary with user theme and Bootstrap tokens.',
  },
  {
    principle: 'Operable',
    supportLevel: 'Partially supports',
    notes:
      'Keyboard access, visible focus styles, route announcements, and reduced-motion preferences are supported. Mobile search is not duplicated in the sticky header below the large breakpoint.',
  },
  {
    principle: 'Understandable',
    supportLevel: 'Supports',
    notes:
      'Pages use clear headings, labeled forms, consistent navigation, and per-route document titles. External links that open in a new tab include an accessible name cue.',
  },
  {
    principle: 'Robust',
    supportLevel: 'Supports',
    notes:
      'Valid HTML landmarks, associated labels, and automated linting and testing help keep markup compatible with assistive technologies.',
  },
] as const

export const accessibilityKnownLimitations: readonly string[] = [
  'Package cards and catalog counts depend on registry index data loaded at runtime.',
  'Links to GitHub, raw registry URLs, and other third-party destinations are not covered by this conformance report.',
  'Search in the header is available only on large viewports when scrolled; smaller viewports use hero search only.',
  'This report is based on a self-assessment and automated checks, not an independent third-party audit.',
] as const

export const accessibilityMeasures: readonly string[] = [
  'Skip link to main content on every page',
  'Semantic landmarks, heading hierarchy, and per-route document titles',
  'Route change announcements and programmatic focus on main content',
  'Consistent external-link labeling for new-tab navigation',
  'Light, dark, and system color modes with theme-color meta updates',
  'Reduced-motion support for non-essential transitions',
  'eslint-plugin-jsx-a11y, vitest-axe component tests, Lighthouse CI, and pa11y scans in pull request checks',
] as const
