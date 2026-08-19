import type { PrivacyPolicyContent } from './privacyPolicyContent.types.ts'

export const privacyPolicyLastUpdated = '2026-08-19'

export const privacyPolicyContentEn: PrivacyPolicyContent = {
  pageTitle: 'Privacy policy',
  languageLinkLabel: 'Versão em português (Brasil)',
  languageLinkPath: '/privacidade',
  lastUpdatedLabel: 'Last updated',
  lastUpdated: privacyPolicyLastUpdated,
  contactLinkLabel: 'Contact',
  cookieTableHeaders: {
    name: 'Name',
    purpose: 'Purpose',
    storage: 'Storage',
    duration: 'Duration',
    consentRequired: 'Consent required',
  },
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      paragraphs: [
        'This privacy policy explains how Agents Repo (agents-repo.org) collects, uses, and protects information when you use our web application.',
        'This notice applies to visitors from the European Union, the United Kingdom, the United States, Brazil, and other regions.',
      ],
    },
    {
      id: 'data-we-collect',
      title: 'Data we collect',
      paragraphs: [
        'We intentionally collect very little personal data. Depending on your choices, we may process:',
      ],
      listItems: [
        'Analytics data (only if you accept analytics cookies) through Google Tag Manager and related Google Analytics tags.',
        'Browser local preferences such as theme mode, catalog filter sidebar collapsed state, and optional registry source overrides you configure.',
        'Registry catalog JSON, package detail JSON, tag lists, and chat instruction JSON/markdown cached in IndexedDB so repeat visits can reuse recently fetched registry payloads. This cache is not used for analytics and does not require extra consent.',
        'Your analytics consent choice stored locally so we can remember your preference.',
        'Technical information processed by third-party services we link to (for example GitHub or registry hosts) when you choose to visit them.',
      ],
    },
    {
      id: 'how-we-use-data',
      title: 'How we use data',
      listItems: [
        'Operate the site, including catalog browsing, search, downloads, and optional PWA installation.',
        'Remember your theme, catalog filter sidebar, and registry settings.',
        'Reuse recently fetched registry JSON and markdown from IndexedDB while you browse.',
        'Measure aggregated site usage when you accept analytics cookies.',
        'Respond to contact and privacy requests you send us.',
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies and similar technologies',
      paragraphs: [
        'We use browser local storage for preferences and consent, and IndexedDB for registry JSON and markdown caches. Analytics tags load only after you accept analytics in the cookie banner.',
      ],
      cookieRows: [
        {
          name: 'analytics-consent',
          purpose: 'Stores your analytics consent decision (accepted or rejected).',
          storage: 'localStorage',
          duration: 'Until you clear site data or change preferences.',
          consentRequired: 'No (required to remember your choice).',
        },
        {
          name: 'theme',
          purpose: 'Stores your light, dark, or auto theme preference.',
          storage: 'localStorage',
          duration: 'Until you clear site data.',
          consentRequired: 'No (preference).',
        },
        {
          name: 'catalog.filters.sidebarCollapsed',
          purpose: 'Stores whether the packages listing filter sidebar is collapsed on large screens.',
          storage: 'localStorage',
          duration: 'Until you clear site data.',
          consentRequired: 'No (preference).',
        },
        {
          name: 'registry.source.baseUrlOverride',
          purpose: 'Optional registry fetch base URL you configure in Website settings.',
          storage: 'localStorage',
          duration: 'Until you clear site data or reset settings.',
          consentRequired: 'No (user-requested functionality).',
        },
        {
          name: 'registry.source.githubRepositoryUrlOverride',
          purpose: 'Optional registry GitHub repository URL you configure in Website settings.',
          storage: 'localStorage',
          duration: 'Until you clear site data or reset settings.',
          consentRequired: 'No (user-requested functionality).',
        },
        {
          name: 'agents-repo-webapp-registry',
          purpose: 'Caches registry catalog JSON, package detail JSON, tag lists, and chat instruction JSON/markdown in your browser. ZIP downloads are not stored here. Website settings Clear cache removes these stores.',
          storage: 'IndexedDB',
          duration: 'Until TTL expiry, you use Clear cache, or you clear site data. Catalog and detail use 24h freshness; tags use 1h; version-pinned chat payloads skip the short TTL.',
          consentRequired: 'No (strictly necessary for catalog browsing).',
        },
        {
          name: 'Google Tag Manager / Google Analytics',
          purpose: 'Aggregated usage analytics when you accept analytics cookies.',
          storage: 'Cookies and similar technologies set by Google',
          duration: 'Per Google policies; see Google privacy documentation.',
          consentRequired: 'Yes.',
        },
      ],
    },
    {
      id: 'third-parties',
      title: 'Third parties',
      paragraphs: [
        'We use Google Tag Manager to load analytics tags when you consent. Google may process usage data according to its own policies.',
        'We link to GitHub and registry hosts for package sources. Those services have separate privacy practices.',
        'See the Google Privacy Policy at https://policies.google.com/privacy for details about Google processing.',
      ],
    },
    {
      id: 'transfers',
      title: 'International transfers',
      paragraphs: [
        'If you are in the EU, UK, or Brazil, note that analytics data processed by Google may be transferred to the United States and other countries.',
        'Where required, we rely on appropriate safeguards such as standard contractual clauses or equivalent mechanisms offered by service providers.',
      ],
    },
    {
      id: 'retention',
      title: 'Retention',
      listItems: [
        'Consent and preference values remain in your browser until you clear them or change your choices.',
        'Registry IndexedDB caches remain until they expire, you choose Clear cache in website settings, or you clear site data.',
        'Analytics retention follows Google Tag Manager / Google Analytics configuration and policies.',
      ],
    },
    {
      id: 'your-rights',
      title: 'Your rights',
      paragraphs: ['Depending on where you live, you may have some or all of the following rights:'],
      listItems: [
        'EU/UK (GDPR): access, rectification, erasure, restriction, portability, objection, withdraw consent, and lodge a complaint with a supervisory authority.',
        'United States (state privacy laws): know what we collect, request deletion, and opt out of sale/sharing for cross-context behavioral advertising using Reject analytics or Cookie preferences.',
        'Brazil (LGPD): confirmation, access, correction, anonymization, portability, deletion, information about sharing, revoke consent, and lodge a complaint with ANPD.',
      ],
    },
    {
      id: 'children',
      title: 'Children',
      paragraphs: [
        'Agents Repo is not directed at children under 16 (EU) or 13 (US). We do not knowingly collect personal information from children.',
      ],
    },
    {
      id: 'do-not-sell',
      title: 'Do not sell or share',
      paragraphs: [
        'We do not sell your personal information for money.',
        'You can opt out of analytics sharing by selecting Reject analytics in the cookie banner or reopening Cookie preferences in the footer.',
      ],
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      paragraphs: [
        'We may update this policy from time to time. We will revise the last updated date at the top of this page when changes are published.',
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      paragraphs: [
        'For privacy requests or questions about this policy, contact us through the Contact page.',
      ],
    },
  ],
}
