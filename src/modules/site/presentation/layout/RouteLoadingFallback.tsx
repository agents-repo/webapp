import { useEffect } from 'react'
import { Spinner } from 'react-bootstrap'

function RouteLoadingFallback() {
  useEffect(() => {
    const mainContent = document.getElementById('main-content')
    mainContent?.setAttribute('aria-busy', 'true')

    return () => {
      mainContent?.removeAttribute('aria-busy')
    }
  }, [])

  return (
    <div className="py-5 d-flex justify-content-center" role="status">
      <span className="visually-hidden">Loading page content</span>
      <Spinner animation="border" aria-hidden="true" />
    </div>
  )
}

export default RouteLoadingFallback
