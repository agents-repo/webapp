import type { PackageDetailDocument } from '../domain/packageDetail.ts'
import { getPackageDetailPath } from './packageSiteRoutes.ts'

export function getPackageSiteMarkdownPublicPath(namespace: string, packageId: string): string {
  return `${getPackageDetailPath(namespace, packageId)}.md`
}

export function buildPackageSiteMarkdownDocument(
  namespace: string,
  packageId: string,
  detail: PackageDetailDocument,
  siteOrigin: string,
): string {
  const pagePath = getPackageDetailPath(namespace, packageId)
  const markdownPath = getPackageSiteMarkdownPublicPath(namespace, packageId)
  const lines: string[] = [
    `# ${detail.metadata.name}`,
    '',
    detail.metadata.description.trim(),
    '',
    `- Package: \`${detail.package}\``,
    `- Version: \`${detail.version}\``,
    `- HTML page: ${siteOrigin}${pagePath}/`,
    `- Markdown: ${siteOrigin}${markdownPath}`,
    '',
  ]

  if (detail.agents.length > 0) {
    lines.push('## Agents', '')
    for (const agent of detail.agents) {
      lines.push(`- **${agent.name}**: ${agent.description}`)
    }
    lines.push('')
  }

  if (detail.flows.length > 0) {
    lines.push('## Flows', '')
    for (const flow of detail.flows) {
      lines.push(`- **${flow.name}**: ${flow.description}`)
    }
    lines.push('')
  }

  if (detail.readmeMarkdown?.trim()) {
    lines.push('## README', '', detail.readmeMarkdown.trim(), '')
  }

  return `${lines.join('\n').trimEnd()}\n`
}
