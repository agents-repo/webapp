import { getGuideDetailPath, listGuideManifestEntries } from './guideManifest.ts'
import type { GuideManifestEntry } from './guideManifest.types.ts'

export interface GuideSearchResult {
  readonly slug: string
  readonly title: string
  readonly href: string
  readonly snippet: string
}

export interface GuideSearchOptions {
  readonly maxResults?: number
}

const DEFAULT_MAX_RESULTS = 10
const SNIPPET_RADIUS = 60

interface GuideSearchIndexEntry {
  readonly entry: GuideManifestEntry
  readonly titleLower: string
  readonly descriptionLower: string
  readonly bodyPlainLower: string
  readonly bodyPlain: string
}

function nextMarkdownSpecialIndex(imageStart: number, linkStart: number): number {
  if (imageStart === -1) {
    return linkStart
  }

  if (linkStart === -1) {
    return imageStart
  }

  return Math.min(imageStart, linkStart)
}

function consumeMarkdownImage(text: string, start: number): { nextIndex: number; replacement: string } | null {
  const closeBracket = text.indexOf(']', start + 2)
  const openParen = closeBracket === -1 ? -1 : text.indexOf('(', closeBracket + 1)
  const closeParen = openParen === -1 ? -1 : text.indexOf(')', openParen + 1)

  if (closeBracket === -1 || openParen !== closeBracket + 1 || closeParen === -1) {
    return null
  }

  return { nextIndex: closeParen + 1, replacement: ' ' }
}

function consumeMarkdownLink(text: string, start: number): { nextIndex: number; replacement: string } | null {
  const closeBracket = text.indexOf(']', start + 1)
  const openParen = closeBracket === -1 ? -1 : text.indexOf('(', closeBracket + 1)
  const closeParen = openParen === -1 ? -1 : text.indexOf(')', openParen + 1)

  if (closeBracket === -1 || openParen !== closeBracket + 1 || closeParen === -1) {
    return null
  }

  return { nextIndex: closeParen + 1, replacement: text.slice(start + 1, closeBracket) }
}

function replaceMarkdownLinksAndImages(text: string): string {
  let output = ''
  let index = 0

  while (index < text.length) {
    const imageStart = text.indexOf('![', index)
    const linkStart = text.indexOf('[', index)
    const nextSpecial = nextMarkdownSpecialIndex(imageStart, linkStart)

    if (nextSpecial === -1) {
      output += text.slice(index)
      break
    }

    output += text.slice(index, nextSpecial)

    const consumed =
      nextSpecial === imageStart
        ? consumeMarkdownImage(text, imageStart)
        : consumeMarkdownLink(text, linkStart)

    if (!consumed) {
      output += text[nextSpecial]
      index = nextSpecial + 1
      continue
    }

    output += consumed.replacement
    index = consumed.nextIndex
  }

  return output
}

function stripLinePrefix(line: string): string {
  let trimmed = line
  let hashCount = 0

  while (hashCount < 6 && trimmed[hashCount] === '#') {
    hashCount += 1
  }

  if (hashCount > 0 && trimmed[hashCount] === ' ') {
    trimmed = trimmed.slice(hashCount + 1)
  }

  let index = 0
  while (index < trimmed.length && trimmed[index] === ' ') {
    index += 1
  }

  if (index < trimmed.length && (trimmed[index] === '-' || trimmed[index] === '*' || trimmed[index] === '+')) {
    if (trimmed[index + 1] === ' ') {
      return trimmed.slice(index + 2)
    }
  }

  let digitIndex = index
  while (digitIndex < trimmed.length && trimmed[digitIndex] >= '0' && trimmed[digitIndex] <= '9') {
    digitIndex += 1
  }

  if (digitIndex > index && trimmed[digitIndex] === '.' && trimmed[digitIndex + 1] === ' ') {
    return trimmed.slice(digitIndex + 2)
  }

  return trimmed
}

function stripGuideMarkdownForSearch(body: string): string {
  let text = body

  text = text.replace(/```[\s\S]*?```/g, ' ')
  text = text.replace(/`[^`\n]*`/g, ' ')
  text = replaceMarkdownLinksAndImages(text)
  text = text
    .split('\n')
    .map((line) => stripLinePrefix(line))
    .join('\n')
  text = text.replace(/[*_~>|]/g, ' ')
  text = text.replace(/\s+/g, ' ').trim()

  return text
}

function buildSnippet(bodyPlain: string, queryLower: string, fallback: string): string {
  const bodyLower = bodyPlain.toLowerCase()
  const matchIndex = bodyLower.indexOf(queryLower)

  if (matchIndex === -1) {
    return fallback
  }

  const start = Math.max(0, matchIndex - SNIPPET_RADIUS)
  const end = Math.min(bodyPlain.length, matchIndex + queryLower.length + SNIPPET_RADIUS)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < bodyPlain.length ? '…' : ''

  return `${prefix}${bodyPlain.slice(start, end).trim()}${suffix}`
}

function matchRank(
  indexEntry: GuideSearchIndexEntry,
  queryLower: string,
): 'title' | 'description' | 'body' | null {
  if (indexEntry.titleLower.includes(queryLower)) {
    return 'title'
  }

  if (indexEntry.descriptionLower.includes(queryLower)) {
    return 'description'
  }

  if (indexEntry.bodyPlainLower.includes(queryLower)) {
    return 'body'
  }

  return null
}

const rankOrder: Record<NonNullable<ReturnType<typeof matchRank>>, number> = {
  title: 0,
  description: 1,
  body: 2,
}

function buildGuideSearchIndex(): readonly GuideSearchIndexEntry[] {
  return listGuideManifestEntries().map((entry) => {
    const bodyPlain = stripGuideMarkdownForSearch(entry.bodyMarkdown)

    return {
      entry,
      titleLower: entry.title.toLowerCase(),
      descriptionLower: entry.description.toLowerCase(),
      bodyPlainLower: bodyPlain.toLowerCase(),
      bodyPlain,
    }
  })
}

let guideSearchIndex: readonly GuideSearchIndexEntry[] | null = null

function getGuideSearchIndex(): readonly GuideSearchIndexEntry[] {
  guideSearchIndex ??= buildGuideSearchIndex()

  return guideSearchIndex
}

export function searchGuidePages(query: string, options?: GuideSearchOptions): GuideSearchResult[] {
  const normalizedQuery = query.trim().toLowerCase()
  const maxResults = options?.maxResults ?? DEFAULT_MAX_RESULTS

  if (!normalizedQuery) {
    return []
  }

  const matches: Array<{ indexEntry: GuideSearchIndexEntry; rank: NonNullable<ReturnType<typeof matchRank>> }> =
    []

  for (const indexEntry of getGuideSearchIndex()) {
    const rank = matchRank(indexEntry, normalizedQuery)
    if (rank) {
      matches.push({ indexEntry, rank })
    }
  }

  matches.sort((left, right) => {
    const rankDiff = rankOrder[left.rank] - rankOrder[right.rank]
    if (rankDiff !== 0) {
      return rankDiff
    }

    const orderDiff = left.indexEntry.entry.order - right.indexEntry.entry.order
    if (orderDiff !== 0) {
      return orderDiff
    }

    return left.indexEntry.entry.title.localeCompare(right.indexEntry.entry.title)
  })

  return matches.slice(0, maxResults).map(({ indexEntry, rank }) => {
    const { entry } = indexEntry
    const snippet =
      rank === 'body'
        ? buildSnippet(indexEntry.bodyPlain, normalizedQuery, entry.description)
        : entry.description

    return {
      slug: entry.slug,
      title: entry.title,
      href: getGuideDetailPath(entry.slug),
      snippet,
    }
  })
}

export { stripGuideMarkdownForSearch }
