import { Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getDocDetailPath } from '../../application/docs/docsCatalog.ts'
import { useExternalLinkAccessibleName } from '../../application/accessibility/useExternalLinkAccessibleName'
import { listRepositoryManifestEntries } from '../../application/repositories/repositoryManifest.ts'
import { useLocalizedSitePath } from '../../application/i18n/useLocalizedSitePath.ts'
import { siteRoutes } from '../routes/siteRoutes'
import RepositoryCard from '../repositories/RepositoryCard.tsx'

const ORG_CONTRIBUTING_URL = 'https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md'
const ORG_ROADMAP_URL = 'https://github.com/agents-repo/.github/blob/main/ROADMAP.md'
const REGISTRY_CONTRIBUTING_URL =
  'https://github.com/agents-repo/registry/blob/main/.github/CONTRIBUTING.md'
const REGISTRY_ISSUES_URL = 'https://github.com/agents-repo/registry/issues'
const WEBAPP_CONTRIBUTING_URL =
  'https://github.com/agents-repo/webapp/blob/main/.github/CONTRIBUTING.md'
const WEBAPP_ISSUES_URL = 'https://github.com/agents-repo/webapp/issues'
const CLI_CONTRIBUTING_URL = 'https://github.com/agents-repo/cli/blob/main/.github/CONTRIBUTING.md'
const CLI_ISSUES_URL = 'https://github.com/agents-repo/cli/issues'

type ContributeWayId =
  | 'publishPackage'
  | 'improveDocs'
  | 'fixBugs'
  | 'improveCli'
  | 'improveWebapp'
  | 'addTests'
  | 'proposeSpecs'

const contributeWayIds: readonly ContributeWayId[] = [
  'publishPackage',
  'improveDocs',
  'fixBugs',
  'improveCli',
  'improveWebapp',
  'addTests',
  'proposeSpecs',
]

function ContributePage() {
  const { t } = useTranslation('pages')
  const localizedSitePath = useLocalizedSitePath()
  const externalLinkName = useExternalLinkAccessibleName()
  const entries = listRepositoryManifestEntries()

  return (
    <div className="py-5">
      <Container>
        <h1 className="h2 mb-4">{t('contribute.title')}</h1>

        <Stack gap={4}>
          <Card>
            <Card.Body>
              <h2 className="h4">{t('contribute.introHeading')}</h2>
              <p className="text-body-secondary mb-0">
                {t('contribute.introBodyPrefix')}{' '}
                <a
                  href={ORG_CONTRIBUTING_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={externalLinkName(t('contribute.introContributingAriaLabel'))}
                >
                  {t('contribute.introContributingLink')}
                </a>
                {t('contribute.introMiddle')}{' '}
                <a
                  href={ORG_ROADMAP_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={externalLinkName(t('contribute.introRoadmapAriaLabel'))}
                >
                  {t('contribute.introRoadmapLink')}
                </a>
                {t('contribute.introSuffix')}
              </p>
            </Card.Body>
          </Card>

          <section aria-labelledby="contribute-ways-heading">
            <h2 id="contribute-ways-heading" className="h4 mb-3">
              {t('contribute.waysHeading')}
            </h2>
            <Row className="g-4">
              {contributeWayIds.map((wayId) => (
                <Col key={wayId} md={6} lg={4}>
                  <Card className="h-100">
                    <Card.Body className="d-flex flex-column">
                      <h3 className="h5">{t(`contribute.ways.${wayId}.heading`)}</h3>
                      <p className="text-body-secondary flex-grow-1">
                        {t(`contribute.ways.${wayId}.body`)}
                      </p>
                      <ul className="mb-0">
                        {wayId === 'publishPackage' ? (
                          <>
                            <li>
                              <NavLink to={localizedSitePath(getDocDetailPath('submitting-a-package'))}>
                                {t('contribute.ways.publishPackage.submitPackageLink')}
                              </NavLink>
                            </li>
                            <li>
                              <a
                                href={REGISTRY_CONTRIBUTING_URL}
                                target="_blank"
                                rel="noreferrer noopener"
                                aria-label={externalLinkName(t('contribute.ways.publishPackage.contributingAriaLabel'))}
                              >
                                {t('contribute.ways.publishPackage.contributingLink')}
                              </a>
                            </li>
                          </>
                        ) : null}
                        {wayId === 'improveDocs' ? (
                          <>
                            <li>
                              <NavLink to={localizedSitePath(siteRoutes.docs)}>
                                {t('contribute.ways.improveDocs.docsLink')}
                              </NavLink>
                            </li>
                            <li>
                              <NavLink to={localizedSitePath(getDocDetailPath('contributing-to-webapp'))}>
                                {t('contribute.ways.improveDocs.contributingWebappLink')}
                              </NavLink>
                            </li>
                          </>
                        ) : null}
                        {wayId === 'fixBugs' ? (
                          <>
                            <li>
                              <a
                                href={WEBAPP_ISSUES_URL}
                                target="_blank"
                                rel="noreferrer noopener"
                                aria-label={externalLinkName(t('contribute.ways.fixBugs.webappIssuesAriaLabel'))}
                              >
                                {t('contribute.ways.fixBugs.webappIssuesLink')}
                              </a>
                            </li>
                            <li>
                              <a
                                href={REGISTRY_ISSUES_URL}
                                target="_blank"
                                rel="noreferrer noopener"
                                aria-label={externalLinkName(t('contribute.ways.fixBugs.registryIssuesAriaLabel'))}
                              >
                                {t('contribute.ways.fixBugs.registryIssuesLink')}
                              </a>
                            </li>
                            <li>
                              <a
                                href={CLI_ISSUES_URL}
                                target="_blank"
                                rel="noreferrer noopener"
                                aria-label={externalLinkName(t('contribute.ways.fixBugs.cliIssuesAriaLabel'))}
                              >
                                {t('contribute.ways.fixBugs.cliIssuesLink')}
                              </a>
                            </li>
                          </>
                        ) : null}
                        {wayId === 'improveCli' ? (
                          <>
                            <li>
                              <a
                                href={CLI_CONTRIBUTING_URL}
                                target="_blank"
                                rel="noreferrer noopener"
                                aria-label={externalLinkName(t('contribute.ways.improveCli.contributingAriaLabel'))}
                              >
                                {t('contribute.ways.improveCli.contributingLink')}
                              </a>
                            </li>
                            <li>
                              <NavLink to={localizedSitePath(getDocDetailPath('cli-commands'))}>
                                {t('contribute.ways.improveCli.cliDocsLink')}
                              </NavLink>
                            </li>
                          </>
                        ) : null}
                        {wayId === 'improveWebapp' ? (
                          <>
                            <li>
                              <NavLink to={localizedSitePath(getDocDetailPath('contributing-to-webapp'))}>
                                {t('contribute.ways.improveWebapp.contributingWebappLink')}
                              </NavLink>
                            </li>
                            <li>
                              <a
                                href={WEBAPP_ISSUES_URL}
                                target="_blank"
                                rel="noreferrer noopener"
                                aria-label={externalLinkName(t('contribute.ways.improveWebapp.issuesAriaLabel'))}
                              >
                                {t('contribute.ways.improveWebapp.issuesLink')}
                              </a>
                            </li>
                          </>
                        ) : null}
                        {wayId === 'addTests' ? (
                          <>
                            <li>
                              <a
                                href={ORG_CONTRIBUTING_URL}
                                target="_blank"
                                rel="noreferrer noopener"
                                aria-label={externalLinkName(t('contribute.ways.addTests.orgContributingAriaLabel'))}
                              >
                                {t('contribute.ways.addTests.orgContributingLink')}
                              </a>
                            </li>
                            <li>
                              <a
                                href={WEBAPP_CONTRIBUTING_URL}
                                target="_blank"
                                rel="noreferrer noopener"
                                aria-label={externalLinkName(t('contribute.ways.addTests.webappContributingAriaLabel'))}
                              >
                                {t('contribute.ways.addTests.webappContributingLink')}
                              </a>
                            </li>
                          </>
                        ) : null}
                        {wayId === 'proposeSpecs' ? (
                          <>
                            <li>
                              <NavLink to={localizedSitePath(getDocDetailPath('how-the-registry-works'))}>
                                {t('contribute.ways.proposeSpecs.registryDocsLink')}
                              </NavLink>
                            </li>
                            <li>
                              <a
                                href={REGISTRY_CONTRIBUTING_URL}
                                target="_blank"
                                rel="noreferrer noopener"
                                aria-label={externalLinkName(t('contribute.ways.proposeSpecs.contributingAriaLabel'))}
                              >
                                {t('contribute.ways.proposeSpecs.contributingLink')}
                              </a>
                            </li>
                          </>
                        ) : null}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>

          <section aria-labelledby="contribute-built-in-the-open-heading">
            <h2 id="contribute-built-in-the-open-heading" className="h4 mb-3">
              {t('contribute.builtInTheOpenHeading')}
            </h2>
            <p className="text-body-secondary">
              {t('contribute.builtInTheOpenBodyPrefix')}{' '}
              <NavLink to={localizedSitePath(siteRoutes.repositories)}>
                {t('contribute.builtInTheOpenRepositoriesLink')}
              </NavLink>
              {t('contribute.builtInTheOpenBodySuffix')}
            </p>
            <Row className="g-4">
              {entries.map((entry) => (
                <Col key={entry.slug} md={6} lg={4}>
                  <RepositoryCard entry={entry} />
                </Col>
              ))}
            </Row>
          </section>

          <Card>
            <Card.Body>
              <h2 className="h4">{t('contribute.relatedHeading')}</h2>
              <p className="text-body-secondary mb-0">
                {t('contribute.relatedPrefix')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.helpUs)}>{t('contribute.relatedHelpUsLink')}</NavLink>
                {t('contribute.relatedAfterHelpUs')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.community)}>{t('contribute.relatedCommunityLink')}</NavLink>
                {t('contribute.relatedAfterCommunity')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.about)}>{t('contribute.relatedAboutLink')}</NavLink>
                {t('contribute.relatedAfterAbout')}{' '}
                <NavLink to={localizedSitePath(siteRoutes.docs)}>{t('contribute.relatedDocsLink')}</NavLink>.
              </p>
            </Card.Body>
          </Card>
        </Stack>
      </Container>
    </div>
  )
}

export default ContributePage
