import { useTranslation } from 'react-i18next'
import { useLocalizedSitePath } from '../../application/i18n/useLocalizedSitePath.ts'
import { siteRoutes } from '../routes/siteRoutes'
import CreatorProfileCard from './CreatorProfileCard'

type CreatorProfilePageKey = 'about' | 'contact'

interface LocalizedCreatorProfileCardProps {
  readonly pageKey: CreatorProfilePageKey
}

function LocalizedCreatorProfileCard({ pageKey }: LocalizedCreatorProfileCardProps) {
  const { t } = useTranslation('pages')
  const localizedSitePath = useLocalizedSitePath()

  return (
    <CreatorProfileCard
      heading={t(`${pageKey}.creatorHeading`)}
      bodyPrefix={t(`${pageKey}.creatorBodyPrefix`)}
      collaboratorsLink={t(`${pageKey}.collaboratorsLink`)}
      bodySuffix={t(`${pageKey}.creatorBodySuffix`)}
      communityPath={localizedSitePath(siteRoutes.community)}
      githubAriaLabel={t(`${pageKey}.creatorGithubAriaLabel`)}
      linkedinAriaLabel={t(`${pageKey}.creatorLinkedinAriaLabel`)}
      githubLabel={t(`${pageKey}.github`)}
      linkedinLabel={t(`${pageKey}.linkedin`)}
    />
  )
}

export default LocalizedCreatorProfileCard
