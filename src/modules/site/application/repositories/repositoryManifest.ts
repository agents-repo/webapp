import type { RepositoryManifestEntry } from './repositoryManifest.types.ts'

const ORG_CONTRIBUTING_URL = 'https://github.com/agents-repo/.github/blob/main/CONTRIBUTING.md'
const ORG_SECURITY_URL = 'https://github.com/agents-repo/.github/blob/main/SECURITY.md'
const SITE_REPOSITORIES_BASE = 'https://agents-repo.org/repositories'

export const repositoryManifest: readonly RepositoryManifestEntry[] = [
  {
    slug: 'registry',
    name: 'Registry',
    description:
      'Open-source specifications and package catalog for agents and multi-agent flows across supported install targets.',
    role: 'data',
    homepage: `${SITE_REPOSITORIES_BASE}/registry`,
    repository: 'https://github.com/agents-repo/registry',
    contributing:
      'https://github.com/agents-repo/registry/blob/main/.github/CONTRIBUTING.md',
    issues: 'https://github.com/agents-repo/registry/issues',
    discussions: 'https://github.com/agents-repo/registry/discussions',
    security: 'https://github.com/agents-repo/registry/security',
    tags: ['catalog', 'specs', 'packages', 'validation'],
    stack: ['Node.js', 'TypeScript', 'Markdown specs', 'ZIP artifacts'],
    relationship:
      'Registry is the source of truth for package metadata, specs, and versioned ZIPs. Webapp and CLI fetch catalog data through registry-proxy by default.',
    audience: 'Package authors, spec maintainers, and contributors adding agents or flows.',
    quickstart: 'npm run package:validate -- --package <namespace>/<package-id>',
    guideLinks: [
      { path: '/guide/how-the-registry-works', label: 'How the registry works' },
      { path: '/guide/submitting-a-package', label: 'Submit a package' },
    ],
  },
  {
    slug: 'registry-proxy',
    name: 'Registry proxy',
    description:
      'Cloudflare Worker that caches and proxies read-only access to registry files on GitHub with optional token auth.',
    role: 'infrastructure',
    homepage: `${SITE_REPOSITORIES_BASE}/registry-proxy`,
    repository: 'https://github.com/agents-repo/registry-proxy',
    contributing:
      'https://github.com/agents-repo/registry-proxy/blob/main/.github/CONTRIBUTING.md',
    issues: 'https://github.com/agents-repo/registry-proxy/issues',
    security: 'https://github.com/agents-repo/registry-proxy/security',
    tags: ['cloudflare', 'worker', 'cache', 'github-raw'],
    stack: ['Cloudflare Workers', 'TypeScript', 'Wrangler'],
    relationship:
      'Sits between consumers (webapp, CLI) and the registry GitHub repository, reducing rate limits and improving fetch reliability.',
    audience: 'Operators and contributors changing proxy behavior, caching, or deployment.',
    quickstart: 'npm run env:check && npm run test',
  },
  {
    slug: 'webapp',
    name: 'Webapp',
    description:
      'Public site for browsing, searching, and downloading agents and flows from the registry (agents-repo.org).',
    role: 'ui',
    homepage: `${SITE_REPOSITORIES_BASE}/webapp`,
    repository: 'https://github.com/agents-repo/webapp',
    contributing: 'https://github.com/agents-repo/webapp/blob/main/.github/CONTRIBUTING.md',
    issues: 'https://github.com/agents-repo/webapp/issues',
    discussions: 'https://github.com/agents-repo/webapp/discussions',
    security: 'https://github.com/agents-repo/webapp/security',
    tags: ['react', 'vite', 'pwa', 'catalog-ui'],
    stack: ['React', 'TypeScript', 'Vite', 'Bootstrap', 'SCSS'],
    relationship:
      'Presents the registry catalog to end users and hosts organization pages such as About, Help Us, and repository documentation.',
    audience: 'Frontend contributors, UX reviewers, and maintainers of site content.',
    quickstart: 'npm install && npm run dev',
    guideLinks: [
      { path: '/guide/contributing-to-webapp', label: 'Contributing to webapp' },
      { path: '/guide/using-the-catalog', label: 'Using the catalog' },
    ],
  },
  {
    slug: 'cli',
    name: 'CLI',
    description:
      'Official CLI to install and manage agents-repo packages for GitHub Copilot, Cursor, Claude Code, and OpenAI Codex.',
    role: 'tooling',
    homepage: `${SITE_REPOSITORIES_BASE}/cli`,
    repository: 'https://github.com/agents-repo/cli',
    contributing: 'https://github.com/agents-repo/cli/blob/main/.github/CONTRIBUTING.md',
    issues: 'https://github.com/agents-repo/cli/issues',
    security: 'https://github.com/agents-repo/cli/security',
    tags: ['npx', 'install-targets', 'lockfile'],
    stack: ['Node.js', 'TypeScript', 'ESM'],
    relationship:
      'Installs packages from the registry into project install targets, using registry-proxy for catalog fetches by default.',
    audience: 'Developers installing packages locally and contributors extending CLI commands.',
    quickstart: 'npm install -D agents-repo && npx agents-repo --help',
    guideLinks: [
      { path: '/guide/installing-packages', label: 'Installing packages' },
      { path: '/guide/cli-commands', label: 'CLI command reference' },
      { path: '/guide/cli-doctor', label: 'doctor diagnostics' },
    ],
  },
  {
    slug: 'github',
    name: '.github',
    description:
      'Organization-wide community health files, shared policies, and contributor workflow defaults for agents-repo.',
    role: 'governance',
    homepage: `${SITE_REPOSITORIES_BASE}/github`,
    repository: 'https://github.com/agents-repo/.github',
    contributing: ORG_CONTRIBUTING_URL,
    issues: 'https://github.com/agents-repo/.github/issues',
    security: ORG_SECURITY_URL,
    tags: ['contributing', 'security', 'org-policies'],
    stack: ['Markdown', 'GitHub community health files'],
    relationship:
      'Defines shared Required Workflow, security reporting, and defaults inherited by child repositories unless overridden.',
    audience: 'Maintainers updating organization policies and cross-repo documentation.',
  },
  {
    slug: 'github-pages',
    name: 'GitHub Pages',
    description:
      'Automated deploy target for the public site (agents-repo.github.io), built from the webapp repository.',
    role: 'infrastructure',
    homepage: `${SITE_REPOSITORIES_BASE}/github-pages`,
    repository: 'https://github.com/agents-repo/agents-repo.github.io',
    contributing: 'https://github.com/agents-repo/webapp/blob/main/docs/deployment.md',
    issues: 'https://github.com/agents-repo/webapp/issues',
    tags: ['github-pages', 'deploy', 'cdn'],
    stack: ['GitHub Pages', 'static hosting'],
    relationship:
      'Receives production builds from webapp CI; custom domain agents-repo.org points at this Pages site.',
    audience: 'Maintainers verifying deployments and site availability.',
    quickstart: 'See webapp docs/deployment.md for build and release flow.',
  },
] as const

const manifestBySlug = new Map(repositoryManifest.map((entry) => [entry.slug, entry]))

export function getRepositoryBySlug(slug: string): RepositoryManifestEntry | undefined {
  return manifestBySlug.get(slug)
}

export function getRepositorySlugs(): readonly string[] {
  return repositoryManifest.map((entry) => entry.slug)
}

export function listRepositoryManifestEntries(): readonly RepositoryManifestEntry[] {
  return repositoryManifest
}
