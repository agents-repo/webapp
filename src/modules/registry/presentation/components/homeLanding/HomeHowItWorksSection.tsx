import type { ReactNode } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getDocDetailPath } from '../../../../site/application/docs/docsCatalog'
import { useLocalizedSitePath } from '../../../../site/application/i18n/useLocalizedSitePath.ts'
import { siteRoutes } from '../../../../site/presentation/routes/siteRoutes'
import { getPackagesIndexPath } from '../../../application/packageSiteRoutes'

function HomeHowItWorksSection() {
  const { t } = useTranslation('catalog')
  const localizedSitePath = useLocalizedSitePath()
  const packagesIndexPath = localizedSitePath(getPackagesIndexPath())
  const installingPackagesPath = localizedSitePath(getDocDetailPath('installing-packages'))
  const installTargetsPath = localizedSitePath(getDocDetailPath('install-targets'))
  const submittingPackagePath = localizedSitePath(getDocDetailPath('submitting-a-package'))
  const helpUsPath = localizedSitePath(siteRoutes.helpUs)

  const steps = [
    {
      title: t('homeLanding.howItWorks.step1Title'),
      body: (
        <>
          {t('homeLanding.howItWorks.step1BodyPrefix')}
          <Link to={packagesIndexPath}>{t('homeLanding.howItWorks.step1PackagesLink')}</Link>
          {t('homeLanding.howItWorks.step1BodySuffix')}
        </>
      ),
    },
    {
      title: t('homeLanding.howItWorks.step2Title'),
      body: (
        <>
          {t('homeLanding.howItWorks.step2BodyPrefix')}
          <Link to={installingPackagesPath}>{t('homeLanding.howItWorks.step2InstallingPackagesLink')}</Link>
          {t('homeLanding.howItWorks.step2BodySuffix')}
        </>
      ),
    },
    {
      title: t('homeLanding.howItWorks.step3Title'),
      body: (
        <>
          {t('homeLanding.howItWorks.step3BodyPrefix')}
          <Link to={installTargetsPath}>{t('homeLanding.howItWorks.step3InstallTargetsLink')}</Link>
          {t('homeLanding.howItWorks.step3BodySuffix')}
        </>
      ),
    },
    {
      title: t('homeLanding.howItWorks.step4Title'),
      body: (
        <>
          {t('homeLanding.howItWorks.step4BodyPrefix')}
          {/* Interim link until /contribute hub ships in webapp#284 */}
          <Link to={submittingPackagePath}>{t('homeLanding.howItWorks.step4SubmitPackageLink')}</Link>
          {t('homeLanding.howItWorks.step4BodySuffix')}
        </>
      ),
    },
    {
      title: t('homeLanding.howItWorks.step5Title'),
      body: (
        <>
          {t('homeLanding.howItWorks.step5BodyPrefix')}
          {/* Interim link until /contribute hub ships in webapp#284 */}
          <Link to={helpUsPath}>{t('homeLanding.howItWorks.step5HelpUsLink')}</Link>
          {t('homeLanding.howItWorks.step5BodySuffix')}
        </>
      ),
    },
  ] as const satisfies ReadonlyArray<{ readonly title: string; readonly body: ReactNode }>

  return (
    <section className="py-4 py-lg-5 bg-body-tertiary">
      <Container>
        <h2 className="h3 text-center mb-4">{t('homeLanding.howItWorks.heading')}</h2>
        <Row as="ol" className="g-4 list-unstyled mb-0">
          {steps.map((step, index) => (
            <Col key={step.title} as="li" md={6} lg={4}>
              <p className="display-6 text-primary fw-semibold mb-2" aria-hidden="true">
                {index + 1}
              </p>
              <h3 className="h5">{step.title}</h3>
              <p className="text-body-secondary mb-0">{step.body}</p>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  )
}

export default HomeHowItWorksSection
