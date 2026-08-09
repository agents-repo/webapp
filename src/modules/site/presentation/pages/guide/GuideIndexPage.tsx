import { Card, Container, Stack } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import {
  getGuideDetailPath,
  listGuideManifestEntries,
  listGuideSectionGroups,
} from '../../../application/guide/guideManifest.ts'
import GuideLayout from './GuideLayout.tsx'

function GuideIndexPage() {
  const sectionGroups = listGuideSectionGroups()
  const totalPages = listGuideManifestEntries().length

  return (
    <GuideLayout>
      <Container fluid className="px-0">
        <h1 className="h2 mb-3">Guides</h1>
        <p className="text-body-secondary lead">
          Learn how to browse the catalog, install packages with the CLI, contribute to the registry, and
          fetch stable markdown for AI agents. {totalPages} topics are available; pick a page from the
          sidebar or below.
        </p>
        <Stack gap={4} className="mt-4">
          {sectionGroups.map((group) => (
            <section key={group.section} aria-labelledby={`guide-section-${group.section}`}>
              <h2 id={`guide-section-${group.section}`} className="h4 mb-3">
                {group.section}
              </h2>
              <Stack gap={3}>
                {group.entries.map((entry) => (
                  <Card key={entry.slug}>
                    <Card.Body>
                      <h3 className="h5 mb-2">
                        <Link to={getGuideDetailPath(entry.slug)}>{entry.title}</Link>
                      </h3>
                      <p className="text-body-secondary mb-0">{entry.description}</p>
                    </Card.Body>
                  </Card>
                ))}
              </Stack>
            </section>
          ))}
        </Stack>
      </Container>
    </GuideLayout>
  )
}

export default GuideIndexPage
