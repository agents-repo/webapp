import { Spinner } from 'react-bootstrap'

function RouteLoadingFallback() {
  return (
    <main id="main-content" tabIndex={-1} aria-busy="true" className="page-shell py-5">
      <div className="visually-hidden">Loading page content</div>
      <div className="d-flex justify-content-center" aria-hidden="true">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading</span>
        </Spinner>
      </div>
    </main>
  )
}

export default RouteLoadingFallback
