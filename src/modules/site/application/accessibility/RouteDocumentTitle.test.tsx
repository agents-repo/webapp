import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import RouteDocumentTitle from './RouteDocumentTitle'
import { formatDocumentTitle } from './useDocumentTitle'

describe('RouteDocumentTitle', () => {
  afterEach(() => {
    cleanup()
    document.title = ''
  })

  it('sets the document title for the active route', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <RouteDocumentTitle />
      </MemoryRouter>,
    )

    expect(document.title).toBe(formatDocumentTitle('About'))
  })
})
