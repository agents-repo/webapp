import type { PrivacyPolicyCookieRow, PrivacyPolicyTableHeaders } from './privacyPolicyContent.types.ts'

export const portuguesePrivacyPolicyCookieTableHeaders: PrivacyPolicyTableHeaders = {
  name: 'Nome',
  purpose: 'Finalidade',
  storage: 'Armazenamento',
  duration: 'Duração',
  consentRequired: 'Consentimento necessário',
}

type PortugueseCookieRowCopy = Pick<PrivacyPolicyCookieRow, 'purpose' | 'duration' | 'consentRequired'>

const portugueseCookieRowTechnicalMetadata = [
  { name: 'analytics-consent', storage: 'localStorage' },
  { name: 'theme', storage: 'localStorage' },
  { name: 'locale', storage: 'localStorage' },
  { name: 'catalog.filters.sidebarCollapsed', storage: 'localStorage' },
  { name: 'registry.source.baseUrlOverride', storage: 'localStorage' },
  { name: 'registry.source.githubRepositoryUrlOverride', storage: 'localStorage' },
  { name: 'agents-repo-webapp-registry', storage: 'IndexedDB' },
  { name: 'html-pages-cache and app-static-runtime-cache', storage: 'Cache Storage' },
  {
    name: 'Google Tag Manager / Google Analytics',
    storage: 'Cookies e tecnologias semelhantes definidos pelo Google',
  },
] as const

export function createPortuguesePrivacyPolicyCookieRows(
  copies: readonly PortugueseCookieRowCopy[],
): readonly PrivacyPolicyCookieRow[] {
  return portugueseCookieRowTechnicalMetadata.map((metadata, index) => ({
    ...metadata,
    ...copies[index],
  }))
}
