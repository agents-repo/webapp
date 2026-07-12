import { Button, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { siteRoutes } from '../routes/siteRoutes'

interface RouteErrorFallbackProps {
  readonly onRetry: () => void
}

function RouteErrorFallback({ onRetry }: RouteErrorFallbackProps) {
  return (
    <div className="py-5" role="alert">
      <Container>
        <h1 className="h2 mb-3">Page failed to load</h1>
        <p className="text-body-secondary mb-4">
          The page could not be loaded. This can happen when you are offline or after an app
          update. Try again or return to the home page.
        </p>
        <div className="d-flex flex-wrap gap-2">
          <Button type="button" variant="primary" onClick={onRetry}>
            Try again
          </Button>
          <Link to={siteRoutes.home} className="btn btn-outline-secondary">
            Go to home
          </Link>
        </div>
      </Container>
    </div>
  )
}

export default RouteErrorFallback
