import { Card, Container, Stack, Table } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  accessibilityConformanceSummary,
  accessibilityKnownLimitations,
  accessibilityMeasures,
  accessibilityStatementReportDate,
  wcagCriterionSummaries,
} from '../../application/accessibility/accessibilityStatementContent'
import { useLocalizedSitePath } from '../../application/i18n/useLocalizedSitePath.ts'
import { siteRoutes } from '../routes/siteRoutes'

function AccessibilityPage() {
  const { t } = useTranslation('pages')
  const localizedSitePath = useLocalizedSitePath()

  return (
    <div className="py-5">
      <Container>
        <h1 className="h2 mb-4">{t('accessibility.title')}</h1>

        <Stack gap={4}>
          <Card>
            <Card.Body>
              <h2 className="h4">{t('accessibility.summaryHeading')}</h2>
              <dl className="mb-0">
                <dt>{t('accessibility.productLabel')}</dt>
                <dd>{accessibilityConformanceSummary.productName}</dd>
                <dt>{t('accessibility.reportVersionLabel')}</dt>
                <dd>{accessibilityConformanceSummary.reportVersion}</dd>
                <dt>{t('accessibility.reportDateLabel')}</dt>
                <dd>{accessibilityStatementReportDate}</dd>
                <dt>{t('accessibility.standardLabel')}</dt>
                <dd>
                  {accessibilityConformanceSummary.wcagVersion}{' '}
                  {accessibilityConformanceSummary.conformanceTarget}
                </dd>
                <dt>{t('accessibility.conformanceStatusLabel')}</dt>
                <dd>{accessibilityConformanceSummary.conformanceStatus}</dd>
              </dl>
              <p className="text-body-secondary mb-0 mt-3">
                {accessibilityConformanceSummary.conformanceStatusDescription}
              </p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('accessibility.scopeHeading')}</h2>
              <p className="text-body-secondary mb-0">{t('accessibility.scopeBody')}</p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('accessibility.measuresHeading')}</h2>
              <ul className="text-body-secondary mb-0">
                {accessibilityMeasures.map((measure) => (
                  <li key={measure}>{measure}</li>
                ))}
              </ul>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('accessibility.wcagHeading')}</h2>
              <Table responsive bordered size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th scope="col">{t('accessibility.principleColumn')}</th>
                    <th scope="col">{t('accessibility.supportLevelColumn')}</th>
                    <th scope="col">{t('accessibility.notesColumn')}</th>
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
              <h2 className="h4">{t('accessibility.limitationsHeading')}</h2>
              <ul className="text-body-secondary mb-0">
                {accessibilityKnownLimitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('accessibility.assessmentHeading')}</h2>
              <p className="text-body-secondary mb-0">{t('accessibility.assessmentBody')}</p>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('accessibility.feedbackHeading')}</h2>
              <p className="text-body-secondary mb-0">
                {t('accessibility.feedbackPrefix')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.contact)}>{t('accessibility.contactLink')}</NavLink>{' '}
                {t('accessibility.feedbackSuffix')}
              </p>
            </Card.Body>
          </Card>
        </Stack>
      </Container>
    </div>
  )
}

export default AccessibilityPage
