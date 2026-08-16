import { Card, Container } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { siteRoutes } from '../../../site/presentation/routes/siteRoutes'
import { getPackagesIndexPath } from '../../application/packageSiteRoutes'

function PackageSiteNotFound() {
  return (
    <div className="py-5">
      <Container>
        <h1 className="h2 mb-3">Package not found</h1>
        <p className="text-body-secondary">
          This package path is not in the loaded registry catalog.
        </p>
        <Card className="border-secondary-subtle">
          <Card.Body>
            <NavLink to={getPackagesIndexPath()}>Browse all packages</NavLink>
            <span className="mx-2 text-body-secondary">·</span>
            <NavLink to={siteRoutes.home}>Return home</NavLink>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}

export default PackageSiteNotFound
