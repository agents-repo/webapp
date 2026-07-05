import { Card, Container, Stack, Table } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import type { PrivacyPolicyContent } from '../../application/privacy/privacyPolicyContent.types.ts'
import { siteRoutes } from '../routes/siteRoutes.ts'

interface PrivacyPolicyViewProps {
  readonly content: PrivacyPolicyContent
}

function PrivacyPolicyView({ content }: PrivacyPolicyViewProps) {
  return (
    <main id="main-content" tabIndex={-1} className="py-5">
      <Container>
        <p className="mb-3">
          <NavLink to={content.languageLinkPath} className="footer-link">
            {content.languageLinkLabel}
          </NavLink>
        </p>

        <h1 className="h2 mb-2">{content.pageTitle}</h1>
        <p className="text-body-secondary mb-4">
          {content.lastUpdatedLabel}: {content.lastUpdated}
        </p>

        <Stack gap={4}>
          {content.sections.map((section) => (
            <Card key={section.id}>
              <Card.Body>
                <h2 className="h4">{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="text-body-secondary">
                    {paragraph}
                  </p>
                ))}
                {section.listItems ? (
                  <ul className="text-body-secondary mb-0">
                    {section.listItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {section.cookieRows ? (
                  <Table responsive bordered size="sm" className="mb-0 mt-3">
                    <thead>
                      <tr>
                        <th scope="col">{content.cookieTableHeaders.name}</th>
                        <th scope="col">{content.cookieTableHeaders.purpose}</th>
                        <th scope="col">{content.cookieTableHeaders.storage}</th>
                        <th scope="col">{content.cookieTableHeaders.duration}</th>
                        <th scope="col">{content.cookieTableHeaders.consentRequired}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.cookieRows.map((row) => (
                        <tr key={row.name}>
                          <th scope="row">{row.name}</th>
                          <td>{row.purpose}</td>
                          <td>{row.storage}</td>
                          <td>{row.duration}</td>
                          <td>{row.consentRequired}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : null}
                {section.id === 'contact' ? (
                  <p className="mb-0 mt-3">
                    <NavLink to={siteRoutes.contact} className="footer-link">
                      {content.contactLinkLabel}
                    </NavLink>
                  </p>
                ) : null}
              </Card.Body>
            </Card>
          ))}
        </Stack>
      </Container>
    </main>
  )
}

export default PrivacyPolicyView
