import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Form, InputGroup, ListGroup } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { searchGuidePages } from '../../../application/guide/guideSearch.ts'
import type { GuideSearchResult } from '../../../application/guide/guideSearch.ts'

function GuideSearch() {
  const navigate = useNavigate()
  const listboxId = useId()
  const inputId = useId()
  const statusId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [listFocused, setListFocused] = useState(false)

  const trimmedQuery = query.trim()
  const results = useMemo(() => searchGuidePages(query), [query])
  const showResults = trimmedQuery.length > 0

  const statusMessage = useMemo(() => {
    if (!showResults) {
      return ''
    }

    if (results.length === 0) {
      return 'No guides match your search.'
    }

    return `${results.length} guide result${results.length === 1 ? '' : 's'}.`
  }, [results.length, showResults])

  const navigateToResult = useCallback(
    (result: GuideSearchResult) => {
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
    const nextResults = searchGuidePages(nextQuery)
    setActiveIndex(nextResults.length > 0 ? 0 : -1)
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showResults) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (results.length === 0) {
        return
      }

      setListFocused(true)
      setActiveIndex((prev) => {
        const next = prev < 0 ? 0 : (prev + 1) % results.length
        return next
      })
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (results.length === 0) {
        return
      }

      setListFocused(true)
      setActiveIndex((prev) => {
        if (prev <= 0) {
          return results.length - 1
        }

        return prev - 1
      })
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const target = activeIndex >= 0 ? results[activeIndex] : results[0]
      if (target) {
        navigateToResult(target)
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setQuery('')
      setActiveIndex(-1)
      setListFocused(false)
      inputRef.current?.blur()
    }
  }

  const activeOptionId =
    activeIndex >= 0 && results[activeIndex] ? `${listboxId}-option-${results[activeIndex].slug}` : undefined

  return (
    <div className="guide-search mb-3">
      <Form
        role="search"
        aria-label="Search guides"
        onSubmit={(event) => {
          event.preventDefault()
          const target = activeIndex >= 0 ? results[activeIndex] : results[0]
          if (target) {
            navigateToResult(target)
          }
        }}
      >
        <Form.Label htmlFor={inputId} className="visually-hidden">
          Search guides
        </Form.Label>
        <InputGroup size="sm" className="guide-search-control">
          <InputGroup.Text className="guide-search-control__addon">
            <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
          </InputGroup.Text>
          <Form.Control
            ref={inputRef}
            id={inputId}
            type="search"
            className="guide-search-control__input"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search guides"
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
          Search guides
        </button>
      </Form>

      <div id={statusId} className="visually-hidden" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>

      {showResults ? (
        <ListGroup
          id={listboxId}
          role="listbox"
          aria-label="Guide search results"
          className="guide-search-results mt-2"
        >
          {results.length === 0 ? (
            <ListGroup.Item className="guide-search-empty text-body-secondary small" role="presentation">
              No guides match your search.
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
                className={`guide-search-result${index === activeIndex ? ' guide-search-result-active' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => {
                  setActiveIndex(index)
                  setListFocused(true)
                }}
                onClick={() => {
                  setQuery('')
                  setActiveIndex(-1)
                  setListFocused(false)
                }}
              >
                <span className="guide-search-result-title d-block fw-semibold">{result.title}</span>
                <span className="guide-search-result-snippet d-block small text-body-secondary">{result.snippet}</span>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      ) : null}
    </div>
  )
}

export default GuideSearch
