import { faCheck, faGlobe } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Dropdown } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { localeDefinitions } from '../../application/i18n/supportedLocales.ts'
import { parseLocaleFromPathname } from '../../application/i18n/localePath.ts'
import { useSwitchLocale } from '../../application/i18n/useLocalizedSitePath.ts'

function LocaleDropdown() {
  const { t } = useTranslation('shell')
  const location = useLocation()
  const switchLocale = useSwitchLocale()
  const { locale, pathnameWithoutLocale } = parseLocaleFromPathname(location.pathname)
  const activeDefinition = localeDefinitions.find((definition) => definition.id === locale) ?? localeDefinitions[0]

  return (
    <Dropdown align="end" className="locale-dropdown">
      <Dropdown.Toggle
        id="locale-dropdown"
        variant="link"
        className="d-inline-flex align-items-center justify-content-center app-header-icon-control"
        aria-label={t('locale.current', { language: activeDefinition.displayName })}
        title={t('locale.current', { language: activeDefinition.displayName })}
      >
        <FontAwesomeIcon icon={faGlobe} className="fa-fw" aria-hidden="true" />
      </Dropdown.Toggle>

      <Dropdown.Menu data-bs-theme="dark">
        {localeDefinitions.map((definition) => (
          <Dropdown.Item
            key={definition.id}
            as="button"
            type="button"
            className="d-flex align-items-center gap-2"
            active={definition.id === locale}
            onClick={() => {
              switchLocale(definition.id, pathnameWithoutLocale)
            }}
          >
            <span className="flex-grow-1">{definition.displayName}</span>
            {definition.id === locale ? <FontAwesomeIcon icon={faCheck} aria-hidden="true" /> : null}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default LocaleDropdown
