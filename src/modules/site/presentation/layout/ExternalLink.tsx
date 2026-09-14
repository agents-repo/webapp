import type { ReactNode } from 'react'
import { useExternalLinkAccessibleName } from '../../application/accessibility/useExternalLinkAccessibleName'

interface ExternalLinkProps {
  readonly href: string
  readonly accessibleLabel: string
  readonly children: ReactNode
  readonly className?: string
}

function ExternalLink({ href, accessibleLabel, children, className }: ExternalLinkProps) {
  const externalLinkName = useExternalLinkAccessibleName()

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={externalLinkName(accessibleLabel)}
      className={className}
    >
      {children}
    </a>
  )
}

export default ExternalLink
