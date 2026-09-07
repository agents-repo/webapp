import { useTranslation } from 'react-i18next'
import {
  getRepositoryDocLinkKey,
} from '../../application/repositories/repositoryPageLocales.ts'
import type { RepositoryManifestEntry } from '../../application/repositories/repositoryManifest.types.ts'

export interface LocalizedRepositoryEntry {
  readonly description: string
  readonly relationship: string
  readonly audience: string
  readonly roleLabel: string
  readonly tags: readonly string[]
  readonly docLinks: readonly { readonly path: string; readonly label: string }[]
}

export function useLocalizedRepositoryEntry(
  entry: RepositoryManifestEntry,
): LocalizedRepositoryEntry {
  const { t } = useTranslation('pages')
  const entryKey = `repositories.entries.${entry.slug}`

  return {
    description: t(`${entryKey}.description`),
    relationship: t(`${entryKey}.relationship`),
    audience: t(`${entryKey}.audience`),
    roleLabel: t(`repositories.roles.${entry.role}`),
    tags: entry.tags.map((tag) => t(`${entryKey}.tags.${tag}`)),
    docLinks:
      entry.docLinks?.map((link) => ({
        path: link.path,
        label: t(`${entryKey}.docLinks.${getRepositoryDocLinkKey(link.path)}`),
      })) ?? [],
  }
}
