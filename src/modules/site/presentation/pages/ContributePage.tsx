import { Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  CLI_CONTRIBUTING_URL,
  CLI_ISSUES_URL,
  ORG_CONTRIBUTING_URL,
  ORG_ROADMAP_URL,
  REGISTRY_CONTRIBUTING_URL,
  REGISTRY_ISSUES_URL,
  WEBAPP_CONTRIBUTING_URL,
  WEBAPP_ISSUES_URL,
} from '../../application/community/githubProjectUrls.ts'
import { getDocDetailPath } from '../../application/docs/docsCatalog.ts'
import { useExternalLinkAccessibleName } from '../../application/accessibility/useExternalLinkAccessibleName'
import { listRepositoryManifestEntries } from '../../application/repositories/repositoryManifest.ts'
import { useLocalizedSitePath } from '../../application/i18n/useLocalizedSitePath.ts'
import ExternalLinkListItem from '../layout/ExternalLinkListItem'
import { siteRoutes } from '../routes/siteRoutes'
import RepositoryCardGrid from '../repositories/RepositoryCardGrid.tsx'

type ContributeWayId =
  | 'publishPackage'
  | 'improveDocs'
  | 'fixBugs'
  | 'improveCli'
  | 'improveWebapp'
  | 'addTests'
  | 'proposeSpecs'

type ContributeInternalLink = {
  readonly kind: 'internal'
  readonly route: string
  readonly labelKey: string
}

type ContributeExternalLink = {
  readonly kind: 'external'
  readonly href: string
  readonly ariaLabelKey: string
  readonly labelKey: string
}

type ContributeWayLink = ContributeInternalLink | ContributeExternalLink

const contributeWayIds: readonly ContributeWayId[] = [
  'publishPackage',
  'improveDocs',
  'fixBugs',
  'improveCli',
  'improveWebapp',
  'addTests',
  'proposeSpecs',
]

const contributeWayLinks: Record<ContributeWayId, readonly ContributeWayLink[]> = {
  publishPackage: [
    {
      kind: 'internal',
      route: getDocDetailPath('submitting-a-package'),
      labelKey: 'contribute.ways.publishPackage.submitPackageLink',
    },
    {
      kind: 'external',
      href: REGISTRY_CONTRIBUTING_URL,
      ariaLabelKey: 'contribute.ways.publishPackage.contributingAriaLabel',
      labelKey: 'contribute.ways.publishPackage.contributingLink',
    },
  ],
  improveDocs: [
    {
      kind: 'internal',
      route: siteRoutes.docs,
      labelKey: 'contribute.ways.improveDocs.docsLink',
    },
    {
      kind: 'internal',
      route: getDocDetailPath('contributing-to-webapp'),
      labelKey: 'contribute.ways.improveDocs.contributingWebappLink',
    },
  ],
  fixBugs: [
    {
      kind: 'external',
      href: WEBAPP_ISSUES_URL,
      ariaLabelKey: 'contribute.ways.fixBugs.webappIssuesAriaLabel',
      labelKey: 'contribute.ways.fixBugs.webappIssuesLink',
    },
    {
      kind: 'external',
      href: REGISTRY_ISSUES_URL,
      ariaLabelKey: 'contribute.ways.fixBugs.registryIssuesAriaLabel',
      labelKey: 'contribute.ways.fixBugs.registryIssuesLink',
    },
    {
      kind: 'external',
      href: CLI_ISSUES_URL,
      ariaLabelKey: 'contribute.ways.fixBugs.cliIssuesAriaLabel',
      labelKey: 'contribute.ways.fixBugs.cliIssuesLink',
    },
  ],
  improveCli: [
    {
      kind: 'external',
      href: CLI_CONTRIBUTING_URL,
      ariaLabelKey: 'contribute.ways.improveCli.contributingAriaLabel',
      labelKey: 'contribute.ways.improveCli.contributingLink',
    },
    {
      kind: 'internal',
      route: getDocDetailPath('cli-commands'),
      labelKey: 'contribute.ways.improveCli.cliDocsLink',
    },
  ],
  improveWebapp: [
    {
      kind: 'internal',
      route: getDocDetailPath('contributing-to-webapp'),
      labelKey: 'contribute.ways.improveWebapp.contributingWebappLink',
    },
    {
      kind: 'external',
      href: WEBAPP_ISSUES_URL,
      ariaLabelKey: 'contribute.ways.improveWebapp.issuesAriaLabel',
      labelKey: 'contribute.ways.improveWebapp.issuesLink',
    },
  ],
  addTests: [
    {
      kind: 'external',
      href: ORG_CONTRIBUTING_URL,
      ariaLabelKey: 'contribute.ways.addTests.orgContributingAriaLabel',
      labelKey: 'contribute.ways.addTests.orgContributingLink',
    },
    {
      kind: 'external',
      href: WEBAPP_CONTRIBUTING_URL,
      ariaLabelKey: 'contribute.ways.addTests.webappContributingAriaLabel',
      labelKey: 'contribute.ways.addTests.webappContributingLink',
    },
  ],
  proposeSpecs: [
    {
      kind: 'internal',
      route: getDocDetailPath('how-the-registry-works'),
      labelKey: 'contribute.ways.proposeSpecs.registryDocsLink',
    },
    {
      kind: 'external',
      href: REGISTRY_CONTRIBUTING_URL,
      ariaLabelKey: 'contribute.ways.proposeSpecs.contributingAriaLabel',
      labelKey: 'contribute.ways.proposeSpecs.contributingLink',
    },
  ],
}

function ContributeWayLinkItem({
  link,
  localizedSitePath,
}: {
  readonly link: ContributeWayLink
  readonly localizedSitePath: (path: string) => string
}) {
  const { t } = useTranslation('pages')

  if (link.kind === 'external') {
    return (
      <ExternalLinkListItem href={link.href} accessibleLabel={t(link.ariaLabelKey)}>
        {t(link.labelKey)}
      </ExternalLinkListItem>
    )
  }

  return (
    <li>
      <NavLink to={localizedSitePath(link.route)}>{t(link.labelKey)}</NavLink>
    </li>
  )
}

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
                        {contributeWayLinks[wayId].map((link) => (
                          <ContributeWayLinkItem
                            key={link.labelKey}
                            link={link}
                            localizedSitePath={localizedSitePath}
                          />
                        ))}
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
              </NavLink>{' '}
              {t('contribute.builtInTheOpenBodySuffix')}
            </p>
            <RepositoryCardGrid entries={entries} />
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
