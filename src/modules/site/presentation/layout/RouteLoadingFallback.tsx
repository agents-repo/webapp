import { Spinner } from 'react-bootstrap'

function RouteLoadingFallback() {
  return (
    <div className="page-shell py-5 d-flex justify-content-center" role="status">
      <span className="visually-hidden">Loading page content</span>
      <Spinner animation="border" aria-hidden="true" />
    </div>
  )
}

export default RouteLoadingFallback
