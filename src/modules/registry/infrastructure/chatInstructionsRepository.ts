import { parseChatInstructionsManifest, type ChatInstructionsManifest } from '../application/chatConsumption'

export const fetchChatInstructionsManifest = async (
  url: string,
  signal?: AbortSignal,
): Promise<ChatInstructionsManifest> => {
  const response = await fetch(url, {
    signal,
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Unable to load chat instructions (${response.status}).`)
  }

  const payload: unknown = await response.json()
  const parsed = parseChatInstructionsManifest(payload)

  if (!parsed) {
    throw new Error('Chat instructions response does not match the expected schema.')
  }

  if (parsed.instructions.length === 0) {
    throw new Error('This package has no chat instructions to copy.')
  }

  return parsed
}

export const fetchChatInstructionMarkdown = async (
  url: string,
  signal?: AbortSignal,
): Promise<string> => {
  const response = await fetch(url, {
    signal,
    cache: 'no-store',
    headers: { Accept: 'text/markdown, text/plain, */*' },
  })

  if (!response.ok) {
    throw new Error(`Unable to load instruction markdown (${response.status}).`)
  }

  const markdown = await response.text()
  if (!markdown.trim()) {
    throw new Error('Instruction markdown was empty.')
  }

  return markdown
}
