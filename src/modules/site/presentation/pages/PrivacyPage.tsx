import { useDocumentTitle } from '../../application/accessibility/useDocumentTitle'
import { sitePageMeta } from '../../application/accessibility/sitePageMeta'
import { privacyPolicyContentEn } from '../../application/privacy/privacyPolicyContent.en'
import { siteRoutes } from '../routes/siteRoutes'
import PrivacyPolicyView from './PrivacyPolicyView'

function PrivacyPage() {
  useDocumentTitle(sitePageMeta[siteRoutes.privacy].title)

  return <PrivacyPolicyView content={privacyPolicyContentEn} />
}

export default PrivacyPage
