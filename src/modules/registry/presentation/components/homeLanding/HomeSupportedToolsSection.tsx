import { Badge, Container, Stack } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { INSTALL_TARGET_IDS } from '../../../domain/package'
import { getInstallTargetLabel } from '../../../application/installTargets'

function HomeSupportedToolsSection() {
  const { t } = useTranslation('catalog')

  return (
    <section className="py-4 border-bottom border-secondary-subtle">
      <Container className="text-center">
        <h2 className="h3 mb-3">{t('homeLanding.supportedTools.heading')}</h2>
        <Stack
          direction="horizontal"
          gap={2}
          className="flex-wrap justify-content-center"
        >
          {INSTALL_TARGET_IDS.map((targetId) => (
            <Badge key={targetId} bg="secondary" pill className="fs-6 fw-normal">
              {getInstallTargetLabel(targetId)}
            </Badge>
          ))}
        </Stack>
      </Container>
    </section>
  )
}

export default HomeSupportedToolsSection
