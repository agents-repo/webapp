import { REGISTRY_ISSUES_URL } from '../../site/application/community/githubProjectUrls.ts'
import { isSafeExternalHttpUrl } from '../../site/application/urlSafety'
import type { PackageDetailMetadata } from '../domain/packageDetail'

export type PackageIssuesUrlKind = 'packageRepo' | 'registry'

export interface PackageIssuesLink {
  readonly url: string
  readonly kind: PackageIssuesUrlKind
}

const GITHUB_HOSTNAMES = new Set(['github.com', 'www.github.com'])

function stripGitRepositorySuffix(repository: string): string {
  return repository.endsWith('.git') ? repository.slice(0, -4) : repository
}

function parseGitHubRepositoryUrl(url: string): { readonly owner: string; readonly repo: string } | null {
  try {
    const parsed = new URL(url.trim())
    if (!GITHUB_HOSTNAMES.has(parsed.hostname)) {
      return null
    }

    const segments = parsed.pathname.split('/').filter((segment) => segment.length > 0)
    if (segments.length < 2) {
      return null
    }

    return {
      owner: segments[0],
      repo: stripGitRepositorySuffix(segments[1]),
    }
  } catch {
    return null
  }
}

function buildGitHubRepositoryIssuesUrl(repositoryUrl: string): string | null {
  const repository = parseGitHubRepositoryUrl(repositoryUrl)
  if (!repository) {
    return null
  }

  return `https://github.com/${repository.owner}/${repository.repo}/issues`
}

function buildRegistryIssuesLink(packageRef: string): PackageIssuesLink {
  const params = new URLSearchParams()
  params.set('title', `Package: ${packageRef}`)
  params.set('body', `Package reference: \`${packageRef}\`\n\nDescribe the issue:\n`)

  return {
    url: `${REGISTRY_ISSUES_URL}/new?${params.toString()}`,
    kind: 'registry',
  }
}

export function buildPackageIssuesUrl(
  metadata: PackageDetailMetadata,
  packageRef: string,
): PackageIssuesLink {
  const repositoryCandidates = [metadata.repository, metadata.homepage].filter(
    (value): value is string => typeof value === 'string' && value.length > 0,
  )

  for (const candidate of repositoryCandidates) {
    if (!isSafeExternalHttpUrl(candidate)) {
      continue
    }

    const issuesUrl = buildGitHubRepositoryIssuesUrl(candidate)
    if (issuesUrl && isSafeExternalHttpUrl(issuesUrl)) {
      return { url: issuesUrl, kind: 'packageRepo' }
    }
  }

  return buildRegistryIssuesLink(packageRef)
}
