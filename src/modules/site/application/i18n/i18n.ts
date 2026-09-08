import i18n from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next'
import enCatalog from '../../../../locales/en/catalog.json' with { type: 'json' }
import enDocs from '../../../../locales/en/docs.json' with { type: 'json' }
import enPages from '../../../../locales/en/pages.json' with { type: 'json' }
import enShell from '../../../../locales/en/shell.json' with { type: 'json' }
import { appLocales, defaultAppLocale } from './supportedLocales.ts'

void i18n
  .use(
    resourcesToBackend((language: string, namespace: string) =>
      import(`../../../../locales/${language}/${namespace}.json`),
    ),
  )
  .use(initReactI18next)
  .init({
    resources: {
      [defaultAppLocale]: {
        shell: enShell,
        catalog: enCatalog,
        pages: enPages,
        docs: enDocs,
      },
    },
    partialBundledLanguages: true,
    fallbackLng: defaultAppLocale,
    supportedLngs: [...appLocales],
    defaultNS: 'shell',
    ns: ['shell', 'catalog', 'pages', 'docs'],
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  })

export default i18n
