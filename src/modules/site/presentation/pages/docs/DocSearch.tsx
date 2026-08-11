import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Form, InputGroup, ListGroup } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { searchDocPages } from '../../../application/docs/docsSearch.ts'
import type { DocSearchResult } from '../../../application/docs/docsSearch.ts'

function DocSearch() {
  const navigate = useNavigate()
  const listboxId = useId()
  const inputId = useId()
  const statusId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [activeIndexQuery, setActiveIndexQuery] = useState('')
  const [listFocused, setListFocused] = useState(false)

  const trimmedQuery = query.trim()
  const results = useMemo(() => searchDocPages(query), [query])
  const showResults = trimmedQuery.length > 0

  if (activeIndexQuery !== query) {
    setActiveIndexQuery(query)
    setActiveIndex(trimmedQuery.length > 0 && results.length > 0 ? 0 : -1)
  }

  const statusMessage = useMemo(() => {
    if (!showResults) {
      return ''
    }

    if (results.length === 0) {
      return `No docs match your search for "${trimmedQuery}".`
    }

    return `${results.length} doc result${results.length === 1 ? '' : 's'} for "${trimmedQuery}".`
  }, [results.length, showResults, trimmedQuery])

  const navigateToResult = useCallback(
    (result: DocSearchResult) => {
      void navigate(result.href)
      setQuery('')
      setActiveIndex(-1)
      setListFocused(false)
    },
    [navigate],
  )

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery)
    setListFocused(false)
  }

  const clearSearch = () => {
    setQuery('')
    setActiveIndex(-1)
    setListFocused(false)
  }

  const handleEscape = (event: KeyboardEvent<HTMLInputElement>) => {
    if (query.length === 0) {
      return
    }

    event.preventDefault()
    clearSearch()
    inputRef.current?.blur()
  }

  const handleArrowDown = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    if (results.length === 0) {
      return
    }

    setListFocused(true)
    setActiveIndex((prev) => (prev < 0 ? 0 : (prev + 1) % results.length))
  }

  const handleArrowUp = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    if (results.length === 0) {
      return
    }

    setListFocused(true)
    setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1))
  }

  const handleEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const target = activeIndex >= 0 ? results[activeIndex] : results[0]
    if (target) {
      navigateToResult(target)
    }
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      handleEscape(event)
      return
    }

    if (!showResults) {
      return
    }

    if (event.key === 'ArrowDown') {
      handleArrowDown(event)
      return
    }

    if (event.key === 'ArrowUp') {
      handleArrowUp(event)
      return
    }

    if (event.key === 'Enter') {
      handleEnter(event)
    }
  }

  const activeOptionId =
    activeIndex >= 0 && results[activeIndex] ? `${listboxId}-option-${results[activeIndex].slug}` : undefined

  return (
    <div className="docs-search mb-3">
      <Form
        role="search"
        aria-label="Search docs"
        onSubmit={(event) => {
          event.preventDefault()
          const target = activeIndex >= 0 ? results[activeIndex] : results[0]
          if (target) {
            navigateToResult(target)
          }
        }}
      >
        <Form.Label htmlFor={inputId} className="visually-hidden">
          Search docs
        </Form.Label>
        <InputGroup size="sm" className="docs-search-control">
          <InputGroup.Text className="docs-search-control__addon">
            <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
          </InputGroup.Text>
          <Form.Control
            ref={inputRef}
            id={inputId}
            type="search"
            className="docs-search-control__input"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search docs"
            autoComplete="off"
            aria-controls={showResults ? listboxId : undefined}
            aria-expanded={showResults}
            aria-autocomplete="list"
            aria-activedescendant={listFocused ? activeOptionId : undefined}
            aria-describedby={showResults ? statusId : undefined}
            role="combobox"
          />
        </InputGroup>
        <button type="submit" className="visually-hidden">
          Search docs
        </button>
      </Form>

      <div id={statusId} className="visually-hidden" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>

      {showResults ? (
        <ListGroup
          id={listboxId}
          role="listbox"
          aria-label="Doc search results"
          className="docs-search-results mt-2"
        >
          {results.length === 0 ? (
            <ListGroup.Item className="docs-search-empty text-body-secondary small" role="presentation">
              No docs match your search.
            </ListGroup.Item>
          ) : (
            results.map((result, index) => (
              <ListGroup.Item
                key={result.slug}
                id={`${listboxId}-option-${result.slug}`}
                role="option"
                aria-selected={index === activeIndex}
                action
                as={Link}
                to={result.href}
                className={`docs-search-result${index === activeIndex ? ' docs-search-result-active' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => {
                  setActiveIndex(index)
                  setListFocused(true)
                }}
                onClick={() => {
                  clearSearch()
                }}
              >
                <span className="docs-search-result-title d-block fw-semibold">{result.title}</span>
                <span className="docs-search-result-snippet d-block small text-body-secondary">{result.snippet}</span>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      ) : null}
    </div>
  )
}

export default DocSearch
