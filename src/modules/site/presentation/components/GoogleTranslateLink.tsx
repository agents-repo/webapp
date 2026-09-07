import { faLanguage } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import { buildGoogleTranslateUrl, shouldShowGoogleTranslate } from '../../application/i18n/googleTranslate.ts'
import { useLocale } from '../../application/i18n/useLocale.ts'

function GoogleTranslateLink() {
  const { t } = useTranslation('shell')
  const { locale } = useLocale()

  if (!shouldShowGoogleTranslate(locale)) {
    return null
  }

  return (
    <a
      href={buildGoogleTranslateUrl(globalThis.location.href, locale)}
      target="_blank"
      rel="noreferrer noopener"
      className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
    >
      <FontAwesomeIcon icon={faLanguage} aria-hidden="true" />
      {t('footer.translateWithGoogle')}
    </a>
  )
}

export default GoogleTranslateLink
