import { afterEach, describe, expect, it } from 'vitest'
import {
  completePackageCatalogSearchFocusHandoff,
  hasActivePackageCatalogSearchFocusHandoff,
  isPackageCatalogSearchInputFocused,
  PACKAGE_CATALOG_SEARCH_INPUT_MARKER,
  shouldFocusPackageCatalogSearch,
  shouldSkipMainContentFocusForCatalogSearch,
  withPackageCatalogSearchFocusState,
} from './catalogSearchNavigation'

describe('catalogSearchNavigation', () => {
  afterEach(() => {
    completePackageCatalogSearchFocusHandoff()
  })

  it('marks navigation state for package catalog search focus handoff', () => {
    expect(withPackageCatalogSearchFocusState()).toEqual({ focusPackageCatalogSearch: true })
    expect(hasActivePackageCatalogSearchFocusHandoff()).toBe(true)
    expect(shouldFocusPackageCatalogSearch(withPackageCatalogSearchFocusState())).toBe(true)
    expect(shouldSkipMainContentFocusForCatalogSearch(withPackageCatalogSearchFocusState())).toBe(
      true,
    )
    completePackageCatalogSearchFocusHandoff()
    expect(hasActivePackageCatalogSearchFocusHandoff()).toBe(false)
  })

  it('ignores unrelated navigation state', () => {
    expect(shouldFocusPackageCatalogSearch(null)).toBe(false)
    expect(shouldFocusPackageCatalogSearch({})).toBe(false)
    expect(shouldFocusPackageCatalogSearch({ focusPackageCatalogSearch: false })).toBe(false)
  })

  it('keeps main-content focus suppressed while handoff is active', () => {
    withPackageCatalogSearchFocusState()
    expect(shouldSkipMainContentFocusForCatalogSearch(null)).toBe(true)
  })

  it('detects focused package catalog search inputs', () => {
    const input = document.createElement('input')
    input.setAttribute(PACKAGE_CATALOG_SEARCH_INPUT_MARKER, '')
    document.body.append(input)

    expect(isPackageCatalogSearchInputFocused()).toBe(false)

    input.focus()
    expect(isPackageCatalogSearchInputFocused()).toBe(true)

    input.remove()
  })
})
