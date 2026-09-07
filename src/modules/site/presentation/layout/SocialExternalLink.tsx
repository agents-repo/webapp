import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faReddit, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useExternalLinkAccessibleName } from '../../application/accessibility/useExternalLinkAccessibleName'
import type { SocialLink, SocialLinkId } from '../../application/community/socialLinks'

const socialLinkIcons: Record<SocialLinkId, IconDefinition> = {
  x: faXTwitter,
  reddit: faReddit,
}

interface SocialExternalLinkProps {
  readonly entry: SocialLink
  readonly className?: string
}

function SocialExternalLink({ entry, className }: SocialExternalLinkProps) {
  const externalLinkName = useExternalLinkAccessibleName()

  return (
    <a
      href={entry.href}
      className={className}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={externalLinkName(entry.accessibleLabel)}
    >
      <FontAwesomeIcon icon={socialLinkIcons[entry.id]} className="me-2" aria-hidden="true" />
      {entry.label}
    </a>
  )
}

export default SocialExternalLink
