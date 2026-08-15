import type { ChatInstructionKind } from '../infrastructure/registrySourceUrl'
import {
  buildRegistryPkgInstructionShortAliasUrl,
  buildRegistryPkgUrl,
  withRegistryQueryParam,
} from '../infrastructure/registrySourceUrl'

export type { ChatInstructionKind }

export interface ChatInstructionEntry {
  readonly kind: ChatInstructionKind
  readonly id: string
  readonly path: string
  readonly agentInstructions?: readonly string[]
}

export interface ChatInstructionsManifest {
  readonly schemaVersion: string
  readonly package: string
  readonly version: string
  readonly instructions: readonly ChatInstructionEntry[]
}

export interface ChatInstructionCopyUrls {
  readonly latestUrl: string
  readonly pinnedUrl: string
  readonly fetchUrl: string
}

export interface ChatPlatformGuide {
  readonly id: 'chatgpt' | 'gemini' | 'copilot-web'
  readonly label: string
  readonly steps: readonly string[]
}

export interface ChatInstructionOptionGroup {
  readonly kind: ChatInstructionKind
  readonly label: string
  readonly instructions: readonly ChatInstructionEntry[]
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const isChatInstructionKind = (value: unknown): value is ChatInstructionKind => {
  return value === 'agent' || value === 'flow'
}

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0
}

const isSafePkgPathSegment = (segment: string): boolean => {
  return segment.length > 0 && segment !== '.' && segment !== '..'
}

const isPkgPath = (value: unknown): value is string => {
  if (!isNonEmptyString(value)) {
    return false
  }

  const path = value.trim()
  if (!path.startsWith('/pkg/')) {
    return false
  }

  const segments = path.split('/')
  return segments[0] === '' && segments.slice(1).every(isSafePkgPathSegment)
}

const parseAgentInstructions = (value: unknown): readonly string[] | null | undefined => {
  if (value === undefined) {
    return undefined
  }

  if (!Array.isArray(value)) {
    return null
  }

  if (value.length === 0) {
    return undefined
  }

  const paths: string[] = []
  for (const item of value) {
    if (!isPkgPath(item)) {
      return null
    }
    paths.push(item.trim())
  }

  return paths
}

const parseInstructionEntry = (value: unknown): ChatInstructionEntry | null => {
  if (!isRecord(value) || !isChatInstructionKind(value.kind) || !isNonEmptyString(value.id) || !isPkgPath(value.path)) {
    return null
  }

  const agentInstructions = parseAgentInstructions(value.agentInstructions)
  if (agentInstructions === null) {
    return null
  }

  return {
    kind: value.kind,
    id: value.id.trim(),
    path: value.path.trim(),
    ...(value.kind === 'flow' && agentInstructions ? { agentInstructions } : {}),
  }
}

export const parseChatInstructionsManifest = (value: unknown): ChatInstructionsManifest | null => {
  if (!isRecord(value)) {
    return null
  }

  if (
    !isNonEmptyString(value.schemaVersion) ||
    !isNonEmptyString(value.package) ||
    !isNonEmptyString(value.version) ||
    !Array.isArray(value.instructions)
  ) {
    return null
  }

  const instructions: ChatInstructionEntry[] = []

  for (const entry of value.instructions) {
    const parsed = parseInstructionEntry(entry)
    if (!parsed) {
      return null
    }
    instructions.push(parsed)
  }

  return {
    schemaVersion: value.schemaVersion.trim(),
    package: value.package.trim(),
    version: value.version.trim(),
    instructions,
  }
}

export const groupChatInstructionsByKind = (
  instructions: readonly ChatInstructionEntry[],
): readonly ChatInstructionOptionGroup[] => {
  const agents = instructions.filter((entry) => entry.kind === 'agent')
  const flows = instructions.filter((entry) => entry.kind === 'flow')
  const groups: ChatInstructionOptionGroup[] = []

  if (agents.length > 0) {
    groups.push({ kind: 'agent', label: 'Agents', instructions: agents })
  }

  if (flows.length > 0) {
    groups.push({ kind: 'flow', label: 'Flows', instructions: flows })
  }

  return groups
}

export const instructionOptionKey = (entry: ChatInstructionEntry): string => {
  return `${entry.kind}:${entry.id}`
}

export const findChatInstruction = (
  instructions: readonly ChatInstructionEntry[],
  key: string,
): ChatInstructionEntry | null => {
  return instructions.find((entry) => instructionOptionKey(entry) === key) ?? null
}

export const buildChatInstructionCopyUrls = (
  registryBaseUrl: string,
  namespace: string,
  packageId: string,
  version: string,
  entry: ChatInstructionEntry,
): ChatInstructionCopyUrls => {
  const latestUrl = buildRegistryPkgInstructionShortAliasUrl(
    registryBaseUrl,
    namespace,
    packageId,
    entry.kind,
    entry.id,
  )
  const pinnedUrl = withRegistryQueryParam(latestUrl, 'version', version)
  const fetchUrl = buildRegistryPkgUrl(registryBaseUrl, entry.path)

  return { latestUrl, pinnedUrl, fetchUrl }
}

const VERSIONED_PKG_PATH_PATTERN = /^\/pkg\/([^/]+)\/([^/]+)\/[^/]+\/(agents|flows)\/([^/]+)$/
const AGENT_INSTRUCTION_FILE_SUFFIX = '.agent.md'

export const CHAT_URL_FETCH_FALLBACK_WARNING =
  'Web chats may fail to fetch instruction URLs from the starter prompt. If the chat cannot load a URL, copy the instruction markdown from this dialog and paste it into the chat.'

export interface ChatRelatedAgentMarkdownSource {
  readonly id: string
  readonly fetchUrl: string
}

export interface ChatRelatedAgentMarkdown {
  readonly id: string
  readonly markdown: string
}

const toShortAliasPkgPath = (versionedPath: string): string | null => {
  const match = VERSIONED_PKG_PATH_PATTERN.exec(versionedPath.trim())
  if (!match) {
    return null
  }

  return `/pkg/${match[1]}/${match[2]}/${match[3]}/${match[4]}`
}

export const instructionIdFromVersionedPkgPath = (versionedPath: string): string | null => {
  const match = VERSIONED_PKG_PATH_PATTERN.exec(versionedPath.trim())
  if (!match) {
    return null
  }

  const filename = match[4]
  if (!filename.endsWith(AGENT_INSTRUCTION_FILE_SUFFIX) || filename.length <= AGENT_INSTRUCTION_FILE_SUFFIX.length) {
    return null
  }

  return filename.slice(0, -AGENT_INSTRUCTION_FILE_SUFFIX.length)
}

export const buildChatRelatedAgentMarkdownSources = (
  registryBaseUrl: string,
  agentInstructionPaths: readonly string[],
): readonly ChatRelatedAgentMarkdownSource[] | null => {
  const sources: ChatRelatedAgentMarkdownSource[] = []

  for (const path of agentInstructionPaths) {
    const id = instructionIdFromVersionedPkgPath(path)
    if (!id) {
      return null
    }

    sources.push({
      id,
      fetchUrl: buildRegistryPkgUrl(registryBaseUrl, path),
    })
  }

  return sources
}

export const buildChatInstructionLatestUrlFromPath = (
  registryBaseUrl: string,
  versionedPath: string,
): string | null => {
  const shortAliasPath = toShortAliasPkgPath(versionedPath)
  if (!shortAliasPath) {
    return null
  }

  return buildRegistryPkgUrl(registryBaseUrl, shortAliasPath)
}

export const buildChatStarterPrompt = (
  entry: ChatInstructionEntry,
  latestUrl: string,
  agentInstructionLatestUrls: readonly string[] = [],
): string => {
  if (entry.kind === 'flow' && agentInstructionLatestUrls.length > 0) {
    const numberedAgents = agentInstructionLatestUrls
      .map((url, index) => `${index + 1}. ${url}`)
      .join('\n')

    return `Follow this flow:\n${latestUrl}\n\nLoad these agent instructions in order:\n${numberedAgents}`
  }

  if (entry.kind === 'flow') {
    return `Follow this flow:\n${latestUrl}`
  }

  return `Follow these agent instructions:\n${latestUrl}`
}

export const buildChatPlatformOpenUrl = (
  platformId: ChatPlatformGuide['id'],
  starterPrompt: string,
): string | null => {
  if (platformId !== 'chatgpt' || starterPrompt.trim().length === 0) {
    return null
  }

  return `https://chatgpt.com/?q=${encodeURIComponent(starterPrompt)}`
}

export const wrapChatInstructionMarkdownForPaste = (kind: ChatInstructionKind, markdown: string): string => {
  if (kind === 'flow') {
    return `Follow this flow:\n\n${markdown}`
  }

  return `Follow these agent instructions:\n\n${markdown}`
}

export const buildChatInstructionMarkdownForPaste = (
  kind: ChatInstructionKind,
  markdown: string,
  relatedAgentMarkdowns: readonly ChatRelatedAgentMarkdown[] = [],
): string => {
  if (kind === 'flow' && relatedAgentMarkdowns.length > 0) {
    const numberedAgents = relatedAgentMarkdowns
      .map((agent, index) => `${index + 1}. ${agent.id}\n\n${agent.markdown}`)
      .join('\n\n')

    return `Follow this flow:\n\n${markdown}\n\nLoad these agent instructions in order:\n\n${numberedAgents}`
  }

  return wrapChatInstructionMarkdownForPaste(kind, markdown)
}

export const CHAT_PLATFORM_GUIDES: readonly ChatPlatformGuide[] = [
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    steps: [
      'Sign in to ChatGPT in the browser if needed.',
      'Use Open in ChatGPT to start a chat with the starter prompt (latest instruction URLs). ChatGPT may send the prompt automatically. ChatGPT may not fetch those URLs.',
      'Or copy the instruction URL, markdown, or starter prompt from this dialog and paste it into ChatGPT.',
    ],
  },
  {
    id: 'gemini',
    label: 'Gemini',
    steps: [
      'Open Gemini in the browser.',
      'Copy the instruction URL, markdown, or starter prompt from this dialog.',
      'Paste it into Gemini and ask it to follow those instructions.',
    ],
  },
  {
    id: 'copilot-web',
    label: 'Microsoft Copilot (web)',
    steps: [
      'Open Microsoft Copilot in the browser (not GitHub Copilot in an IDE).',
      'Copy the instruction URL, markdown, or starter prompt from this dialog.',
      'Paste it into Copilot and ask it to follow those instructions.',
    ],
  },
]
