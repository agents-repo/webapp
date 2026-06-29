import { Card, Container, Stack, Table } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useDocumentTitle } from '../../application/accessibility/useDocumentTitle'
import { sitePageMeta } from '../../application/accessibility/sitePageMeta'
import {
  accessibilityConformanceSummary,
  accessibilityKnownLimitations,
  accessibilityMeasures,
  accessibilityStatementReportDate,
  wcagCriterionSummaries,
} from '../../application/accessibility/accessibilityStatementContent'
import { siteRoutes } from '../routes/siteRoutes'

function AccessibilityPage() {
  useDocumentTitle(sitePageMeta[siteRoutes.accessibility].title)

  return (
    <main id="main-content" tabIndex={-1} className="py-5">
      <Container>
        <h1 className="h2 mb-4">Accessibility statement</h1>

        <Stack gap={4}>
          <Card>
            <Card.Body>
              <h2 className="h4">Summary</h2>
              <dl className="mb-0">
                <dt>Product</dt>
                <dd>{accessibilityConformanceSummary.productName}</dd>
                <dt>Report version</dt>
                <dd>{accessibilityConformanceSummary.reportVersion}</dd>
                <dt>Report date</dt>
                <dd>{accessibilityStatementReportDate}</dd>
                <dt>Standard</dt>
                <dd>
                  {accessibilityConformanceSummary.wcagVersion}{' '}
                  {accessibilityConformanceSummary.conformanceTarget}
                </dd>
                <dt>Conformance status</dt>
                <dd>{accessibilityConformanceSummary.conformanceStatus}</dd>
              </dl>
              <p className="text-body-secondary mb-0 mt-3">
                {accessibilityConformanceSummary.conformanceStatusDescription}
              </p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Scope</h2>
              <p className="text-body-secondary mb-0">
                This Accessibility Conformance Report (ACR) applies to the Agents Repo web application
                user interface served from this site. It does not cover third-party websites such as
                GitHub, LinkedIn, or remote registry hosts linked from the application.
              </p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Measures to support accessibility</h2>
              <ul className="text-body-secondary mb-0">
                {accessibilityMeasures.map((measure) => (
                  <li key={measure}>{measure}</li>
                ))}
              </ul>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">WCAG 2.2 conformance summary</h2>
              <Table responsive bordered size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th scope="col">Principle</th>
                    <th scope="col">Support level</th>
                    <th scope="col">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {wcagCriterionSummaries.map((criterion) => (
                    <tr key={criterion.principle}>
                      <th scope="row">{criterion.principle}</th>
                      <td>{criterion.supportLevel}</td>
                      <td>{criterion.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Known limitations</h2>
              <ul className="text-body-secondary mb-0">
                {accessibilityKnownLimitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Assessment approach</h2>
              <p className="text-body-secondary mb-0">
                This report is based on a self-assessment using manual keyboard testing, automated
                eslint-jsx-a11y linting, vitest-axe component smoke tests, Lighthouse accessibility
                scoring, and pa11y WCAG2AA scans in continuous integration.
              </p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">Feedback and contact</h2>
              <p className="text-body-secondary mb-0">
                If you encounter accessibility barriers on this site, please reach out through the{' '}
                <NavLink to={siteRoutes.contact}>Contact</NavLink> page. Include the page URL, your
                browser and assistive technology, and a description of the issue.
              </p>
            </Card.Body>
          </Card>
        </Stack>
      </Container>
    </main>
  )
}

export default AccessibilityPage
