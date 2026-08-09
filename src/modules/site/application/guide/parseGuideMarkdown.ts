export interface SplitGuideMarkdownResult {
  readonly frontmatter: string
  readonly body: string
}

/** Splits YAML frontmatter from guide markdown (no gray-matter — keeps the client bundle small). */
export function splitGuideMarkdown(raw: string): SplitGuideMarkdownResult {
  if (!raw.startsWith('---')) {
    return { frontmatter: '', body: raw.trim() }
  }

  const endIndex = raw.indexOf('\n---', 3)
  if (endIndex === -1) {
    throw new Error('Guide markdown frontmatter is not closed with ---')
  }

  return {
    frontmatter: raw.slice(4, endIndex).trim(),
    body: raw.slice(endIndex + 4).trim(),
  }
}

export function readFrontmatterScalar(frontmatter: string, key: string): string {
  const pattern = new RegExp(String.raw`^${key}:\s*(.+)$`, 'm')
  const match = pattern.exec(frontmatter)
  return match?.[1]?.trim() ?? ''
}
