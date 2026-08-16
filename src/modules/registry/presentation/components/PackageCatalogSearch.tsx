import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { Form, InputGroup } from 'react-bootstrap'

export interface PackageCatalogSearchProps {
  readonly query: string
  readonly onQueryChange: (query: string) => void
  readonly inputId: string
  readonly ariaLabel?: string
}

export function PackageCatalogSearch({
  query,
  onQueryChange,
  inputId,
  ariaLabel = 'Search packages',
}: PackageCatalogSearchProps): ReactNode {
  return (
    <Form role="search" aria-label={ariaLabel} className="w-100" onSubmit={(event) => event.preventDefault()}>
      <Form.Label htmlFor={inputId} className="visually-hidden">
        Search registry packages
      </Form.Label>
      <InputGroup size="sm" className="search-control">
        <InputGroup.Text className="bg-primary border-primary text-white">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="me-2" aria-hidden="true" />
          Search
        </InputGroup.Text>
        <Form.Control
          id={inputId}
          size="sm"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search by package, owner (@slug), description, or tag"
          className="border-secondary search-input"
        />
      </InputGroup>
      <button type="submit" className="visually-hidden">
        Search
      </button>
    </Form>
  )
}
