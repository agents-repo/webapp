export interface SplitDocMarkdownResult {
  readonly frontmatter: string
  readonly body: string
}

export type DocFrontmatterScalarKey = 'title' | 'description' | 'section' | 'order'

/** Splits YAML frontmatter from site doc markdown (no gray-matter — keeps the client bundle small). */
export function splitDocMarkdown(raw: string): SplitDocMarkdownResult {
  if (!raw.startsWith('---')) {
    return { frontmatter: '', body: raw.trim() }
  }

  const endIndex = raw.indexOf('\n---', 3)
  if (endIndex === -1) {
    throw new Error('Docs markdown frontmatter is not closed with ---')
  }

  return {
    frontmatter: raw.slice(4, endIndex).trim(),
    body: raw.slice(endIndex + 4).trim(),
  }
}

export function readFrontmatterScalar(frontmatter: string, key: DocFrontmatterScalarKey): string {
  const prefix = `${key}:`
  for (const line of frontmatter.split('\n')) {
    if (!line.startsWith(prefix)) {
      continue
    }

    return line.slice(prefix.length).trim()
  }

  return ''
}
