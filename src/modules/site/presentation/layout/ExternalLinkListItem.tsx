import type { ReactNode } from 'react'
import ExternalLink from './ExternalLink'

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
      <ExternalLink href={href} accessibleLabel={accessibleLabel}>
        {children}
      </ExternalLink>
      {suffix !== undefined && <> {suffix}</>}
    </li>
  )
}

export default ExternalLinkListItem
