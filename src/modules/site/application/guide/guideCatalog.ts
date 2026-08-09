import type { GuideManifestEntry } from './guideManifest.types.ts'

export const GUIDE_BASE_PATH = '/guide'

type GuideCatalogMeta = Omit<GuideManifestEntry, 'bodyMarkdown'>

export const guideCatalog: readonly GuideCatalogMeta[] = [
  {
    slug: 'getting-started',
    title: 'Getting started',
    description:
      'What Agents Repo is, how to browse the catalog, and where to go next for installs and contributions.',
    order: 10,
    section: 'Start',
  },
  {
    slug: 'ecosystem-overview',
    title: 'Ecosystem overview',
    description: 'How registry, registry-proxy, webapp, CLI, and organization policies fit together.',
    order: 20,
    section: 'Start',
  },
  {
    slug: 'using-the-catalog',
    title: 'Using the catalog',
    description: 'Search, package cards, downloads, CLI commands from the UI, and website settings.',
    order: 30,
    section: 'Catalog',
  },
  {
    slug: 'discover-packages',
    title: 'Discover packages',
    description: 'Find packages from the site catalog, CLI search, and suggest-agents scoring.',
    order: 40,
    section: 'Catalog',
  },
  {
    slug: 'how-the-registry-works',
    title: 'How the registry works',
    description:
      'Catalog index, package metadata, version manifests, ZIP artifacts, and how webapp and CLI fetch data.',
    order: 50,
    section: 'Registry',
  },
  {
    slug: 'installing-packages',
    title: 'Installing packages',
    description: 'Pin the CLI as a devDependency, initialize targets, install from the catalog, and reproduce in CI.',
    order: 60,
    section: 'CLI',
  },
  {
    slug: 'agents-json-lock',
    title: 'agents.json and lockfile',
    description: 'Project config, semver ranges, registry URL ref, lock slots per target, and what to commit.',
    order: 70,
    section: 'CLI',
  },
  {
    slug: 'cli-commands',
    title: 'CLI command reference',
    description: 'Subcommands, npm parity, aliases, and links to canonical CLI documentation.',
    order: 80,
    section: 'CLI',
  },
  {
    slug: 'install-targets',
    title: 'Install targets',
    description: 'Canonical target ids, typical on-disk paths, and init/add-target workflows.',
    order: 90,
    section: 'CLI',
  },
  {
    slug: 'cli-doctor',
    title: 'doctor diagnostics',
    description: 'Read-only CLI health checks for config, lock, registry reachability, and install paths.',
    order: 100,
    section: 'CLI',
  },
  {
    slug: 'contributing-packages',
    title: 'Contributing packages',
    description: 'Policies, specs, and links for registry package authors.',
    order: 110,
    section: 'Contribute',
  },
  {
    slug: 'submitting-a-package',
    title: 'Submit a package',
    description: 'Issue, branch, validation, build, draft PR, and squash-merge expectations for registry packages.',
    order: 120,
    section: 'Contribute',
  },
  {
    slug: 'contributing-to-webapp',
    title: 'Contributing to webapp',
    description: 'Branch workflow, validation, and agents-repo workflow packages in this repository.',
    order: 130,
    section: 'Contribute',
  },
  {
    slug: 'for-ai-agents',
    title: 'For AI agents',
    description: 'Stable markdown URLs, llms.txt, and curl examples for automated readers.',
    order: 140,
    section: 'Agents',
  },
] as const

const catalogBySlug = new Map(guideCatalog.map((entry) => [entry.slug, entry]))

export function getGuideCatalogEntry(slug: string): GuideCatalogMeta | undefined {
  return catalogBySlug.get(slug)
}

export function getGuideSlugs(): readonly string[] {
  return guideCatalog.map((entry) => entry.slug)
}

export function getGuideDetailPath(slug: string): string {
  return `${GUIDE_BASE_PATH}/${slug}`
}

export function getGuideRoutePaths(): string[] {
  return guideCatalog.map((entry) => getGuideDetailPath(entry.slug))
}
