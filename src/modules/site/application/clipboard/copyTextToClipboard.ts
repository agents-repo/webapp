export type CopyTextResult = 'success' | 'failure'

export const copyTextToClipboard = async (text: string): Promise<CopyTextResult> => {
  if (!text) {
    return 'failure'
  }

  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return 'failure'
  }

  try {
    await navigator.clipboard.writeText(text)
    return 'success'
  } catch {
    return 'failure'
  }
}
