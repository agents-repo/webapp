import { parse } from 'yaml'

export interface PackageMarkdownFrontmatterResult {
  readonly data: Readonly<Record<string, unknown>> | null
  readonly body: string
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const splitClosedFrontmatter = (raw: string): { yamlText: string; body: string } | null => {
  if (!raw.startsWith('---')) {
    return null
  }

  const afterDashes = raw.slice(3)
  let openNewlineLength = 0
  if (afterDashes.startsWith('\r\n')) {
    openNewlineLength = 2
  } else if (afterDashes.startsWith('\n')) {
    openNewlineLength = 1
  }
  if (openNewlineLength === 0) {
    return null
  }

  const afterOpen = afterDashes.slice(openNewlineLength)
  const closeMatch = /(?:^|\r?\n)---[ \t]*(?:\r?\n|$)/.exec(afterOpen)
  if (!closeMatch) {
    return null
  }

  return {
    yamlText: afterOpen.slice(0, closeMatch.index).trim(),
    body: afterOpen.slice(closeMatch.index + closeMatch[0].length).trim(),
  }
}

export const parsePackageMarkdownFrontmatter = (raw: string): PackageMarkdownFrontmatterResult => {
  const split = splitClosedFrontmatter(raw)
  if (!split) {
    return { data: null, body: raw }
  }

  if (split.yamlText === '') {
    return { data: null, body: split.body }
  }

  try {
    const parsed: unknown = parse(split.yamlText)
    if (!isPlainObject(parsed)) {
      return { data: null, body: raw }
    }

    if (Object.keys(parsed).length === 0) {
      return { data: null, body: split.body }
    }

    return { data: parsed, body: split.body }
  } catch {
    return { data: null, body: raw }
  }
}
