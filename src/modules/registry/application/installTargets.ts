import type { InstallTargetId } from '../domain/package'

const INSTALL_TARGET_LABELS: Record<InstallTargetId, string> = {
  'github-copilot': 'GitHub Copilot',
  'claude-code': 'Claude Code',
  cursor: 'Cursor',
  'openai-codex': 'OpenAI Codex',
}

export const getInstallTargetLabel = (targetId: InstallTargetId): string => {
  return INSTALL_TARGET_LABELS[targetId]
}
