import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { Form, InputGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

export interface PackageCatalogSearchProps {
  readonly query: string
  readonly onQueryChange: (query: string) => void
  readonly onSubmit?: (query: string) => void
  readonly inputId: string
  readonly ariaLabel?: string
}

export function PackageCatalogSearch({
  query,
  onQueryChange,
  onSubmit,
  inputId,
  ariaLabel,
}: PackageCatalogSearchProps): ReactNode {
  const { t } = useTranslation('catalog')
  const resolvedAriaLabel = ariaLabel ?? t('search.ariaLabel')

  return (
    <Form
      role="search"
      aria-label={resolvedAriaLabel}
      className="w-100"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit?.(query)
      }}
    >
      <Form.Label htmlFor={inputId} className="visually-hidden">
        {t('search.label')}
      </Form.Label>
      <InputGroup size="sm" className="search-control">
        <InputGroup.Text className="bg-primary border-primary text-white">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" aria-hidden="true" />
          {t('search.button')}
        </InputGroup.Text>
        <Form.Control
          id={inputId}
          size="sm"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t('search.placeholder')}
          className="border-secondary search-input"
        />
      </InputGroup>
      <button type="submit" className="visually-hidden">
        {t('search.button')}
      </button>
    </Form>
  )
}
