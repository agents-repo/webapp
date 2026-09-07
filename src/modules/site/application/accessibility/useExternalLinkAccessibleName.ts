import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { externalLinkAccessibleName } from './externalLink'

export function useExternalLinkAccessibleName(): (label: string) => string {
  const { t } = useTranslation('shell')
  const opensInNewTabLabel = t('accessibility.opensInNewTab')

  return useCallback(
    (label: string) => externalLinkAccessibleName(label, opensInNewTabLabel),
    [opensInNewTabLabel],
  )
}
