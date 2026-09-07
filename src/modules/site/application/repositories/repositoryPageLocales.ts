import type { AppLocale } from '../i18n/supportedLocales.ts'
import { defaultAppLocale } from '../i18n/supportedLocales.ts'
import enPages from '../../../../locales/en/pages.json' with { type: 'json' }
import esPages from '../../../../locales/es/pages.json' with { type: 'json' }
import ptBrPages from '../../../../locales/pt-BR/pages.json' with { type: 'json' }
import ptPtPages from '../../../../locales/pt-PT/pages.json' with { type: 'json' }
import type { RepositoryManifestEntry } from './repositoryManifest.types.ts'

type RepositoryPagesBundle = (typeof enPages)['repositories']

const pagesByLocale: Record<AppLocale, { repositories: RepositoryPagesBundle }> = {
  en: enPages,
  es: esPages,
  'pt-BR': ptBrPages,
  'pt-PT': ptPtPages,
}

function getRepositoryPagesBundle(locale: AppLocale): RepositoryPagesBundle {
  return pagesByLocale[locale]?.repositories ?? pagesByLocale[defaultAppLocale].repositories
}

export function getRepositoryDocLinkKey(path: string): string {
  return path.replace(/^\/docs\//, '')
}

export function getLocalizedRepositoryDescription(slug: string, locale: AppLocale): string | undefined {
  const bundle = getRepositoryPagesBundle(locale)
  const entry = bundle.entries[slug as keyof typeof bundle.entries]

  if (!entry || typeof entry !== 'object' || !('description' in entry)) {
    return undefined
  }

  return entry.description
}

export function getLocalizedRepositoryRoleLabel(
  role: RepositoryManifestEntry['role'],
  locale: AppLocale,
): string {
  const bundle = getRepositoryPagesBundle(locale)
  const roles = bundle.roles as Record<string, string>

  return roles[role] ?? role
}
