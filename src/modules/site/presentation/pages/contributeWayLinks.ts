import {
  CLI_CONTRIBUTING_URL,
  CLI_ISSUES_URL,
  ORG_CONTRIBUTING_URL,
  REGISTRY_CONTRIBUTING_URL,
  REGISTRY_ISSUES_URL,
  WEBAPP_CONTRIBUTING_URL,
  WEBAPP_ISSUES_URL,
} from '../../application/community/githubProjectUrls.ts'
import { getDocDetailPath } from '../../application/docs/docsCatalog.ts'
import { siteRoutes } from '../routes/siteRoutes'

export type ContributeWayId =
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

export type ContributeWayLink = ContributeInternalLink | ContributeExternalLink

function internalLink(route: string, labelKey: string): ContributeInternalLink {
  return { kind: 'internal', route, labelKey }
}

function externalLink(href: string, ariaLabelKey: string, labelKey: string): ContributeExternalLink {
  return { kind: 'external', href, ariaLabelKey, labelKey }
}

export const contributeWayLinks: Record<ContributeWayId, readonly ContributeWayLink[]> = {
  publishPackage: [
    internalLink(getDocDetailPath('submitting-a-package'), 'contribute.ways.publishPackage.submitPackageLink'),
    externalLink(
      REGISTRY_CONTRIBUTING_URL,
      'contribute.ways.publishPackage.contributingAriaLabel',
      'contribute.ways.publishPackage.contributingLink',
    ),
  ],
  improveDocs: [
    internalLink(siteRoutes.docs, 'contribute.ways.improveDocs.docsLink'),
    internalLink(getDocDetailPath('contributing-to-webapp'), 'contribute.ways.improveDocs.contributingWebappLink'),
  ],
  fixBugs: [
    externalLink(WEBAPP_ISSUES_URL, 'contribute.ways.fixBugs.webappIssuesAriaLabel', 'contribute.ways.fixBugs.webappIssuesLink'),
    externalLink(REGISTRY_ISSUES_URL, 'contribute.ways.fixBugs.registryIssuesAriaLabel', 'contribute.ways.fixBugs.registryIssuesLink'),
    externalLink(CLI_ISSUES_URL, 'contribute.ways.fixBugs.cliIssuesAriaLabel', 'contribute.ways.fixBugs.cliIssuesLink'),
  ],
  improveCli: [
    externalLink(
      CLI_CONTRIBUTING_URL,
      'contribute.ways.improveCli.contributingAriaLabel',
      'contribute.ways.improveCli.contributingLink',
    ),
    internalLink(getDocDetailPath('cli-commands'), 'contribute.ways.improveCli.cliDocsLink'),
  ],
  improveWebapp: [
    internalLink(getDocDetailPath('contributing-to-webapp'), 'contribute.ways.improveWebapp.contributingWebappLink'),
    externalLink(WEBAPP_ISSUES_URL, 'contribute.ways.improveWebapp.issuesAriaLabel', 'contribute.ways.improveWebapp.issuesLink'),
  ],
  addTests: [
    externalLink(
      ORG_CONTRIBUTING_URL,
      'contribute.ways.addTests.orgContributingAriaLabel',
      'contribute.ways.addTests.orgContributingLink',
    ),
    externalLink(
      WEBAPP_CONTRIBUTING_URL,
      'contribute.ways.addTests.webappContributingAriaLabel',
      'contribute.ways.addTests.webappContributingLink',
    ),
  ],
  proposeSpecs: [
    internalLink(getDocDetailPath('how-the-registry-works'), 'contribute.ways.proposeSpecs.registryDocsLink'),
    externalLink(
      REGISTRY_CONTRIBUTING_URL,
      'contribute.ways.proposeSpecs.contributingAriaLabel',
      'contribute.ways.proposeSpecs.contributingLink',
    ),
  ],
}

export const contributeWayIds: readonly ContributeWayId[] = [
  'publishPackage',
  'improveDocs',
  'fixBugs',
  'improveCli',
  'improveWebapp',
  'addTests',
  'proposeSpecs',
]
