export const externalLinkOpensInNewTabLabelEn = '(opens in a new tab)'

export function externalLinkAccessibleName(label: string, opensInNewTabLabel: string): string {
  return `${label} ${opensInNewTabLabel}`
}
