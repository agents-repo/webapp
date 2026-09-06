import { Card, Stack } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLocalizedSitePath } from '../../../application/i18n/useLocalizedSitePath.ts'
import { useLocale } from '../../../application/i18n/useLocale.ts'
import {
  getDocDetailPath,
  listDocManifestEntries,
  listDocSectionGroups,
} from '../../../application/docs/docsManifest.ts'
import DocLayout from './DocLayout.tsx'

function DocIndexPage() {
  const { t } = useTranslation('docs')
  const { locale } = useLocale()
  const localizedSitePath = useLocalizedSitePath()
  const sectionGroups = listDocSectionGroups(locale)
  const totalPages = listDocManifestEntries(locale).length

  return (
    <DocLayout>
      <h1 className="h2 mb-3">{t('index.title')}</h1>
      <p className="text-body-secondary lead">
        {t('index.lead', { count: totalPages })}
      </p>
      <Stack gap={4} className="mt-4">
        {sectionGroups.map((group) => (
          <section key={group.section} aria-labelledby={`docs-section-${group.section}`}>
            <h2 id={`docs-section-${group.section}`} className="h4 mb-3">
              {t(`sections.${group.section}`, { defaultValue: group.section })}
            </h2>
            <Stack gap={3}>
              {group.entries.map((entry) => (
                <Card key={entry.slug}>
                  <Card.Body>
                    <h3 className="h5 mb-2">
                      <Link to={localizedSitePath(getDocDetailPath(entry.slug))}>{entry.title}</Link>
                    </h3>
                    <p className="text-body-secondary mb-0">{entry.description}</p>
                  </Card.Body>
                </Card>
              ))}
            </Stack>
          </section>
        ))}
      </Stack>
    </DocLayout>
  )
}

export default DocIndexPage
