import type { ReactNode } from 'react'
import { externalLinkAccessibleName } from '../../application/accessibility/externalLink'

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
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={externalLinkAccessibleName(accessibleLabel)}
      >
        {children}
      </a>
      {suffix !== undefined && <> {suffix}</>}
    </li>
  )
}

export default ExternalLinkListItem
