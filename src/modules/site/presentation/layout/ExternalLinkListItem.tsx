import type { ReactNode } from 'react'
import { useExternalLinkAccessibleName } from '../../application/accessibility/useExternalLinkAccessibleName'

interface ExternalLinkListItemProps {
  readonly href: string
  readonly accessibleLabel: string
  readonly children: ReactNode
  readonly suffix?: ReactNode
}

function ExternalLinkListItem({
  href,
  accessibleLabel,
  children,
  suffix,
}: ExternalLinkListItemProps) {
  const externalLinkName = useExternalLinkAccessibleName()

  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={externalLinkName(accessibleLabel)}
      >
        {children}
      </a>
      {suffix !== undefined && <> {suffix}</>}
    </li>
  )
}

export default ExternalLinkListItem
