import { useDocumentTitle } from '../../application/accessibility/useDocumentTitle'
import { sitePageMeta } from '../../application/accessibility/sitePageMeta'
import { privacyPolicyContentPtBr } from '../../application/privacy/privacyPolicyContent.pt-BR'
import { siteRoutes } from '../routes/siteRoutes'
import PrivacyPolicyView from './PrivacyPolicyView'

function PrivacidadePage() {
  useDocumentTitle(sitePageMeta[siteRoutes.privacyPtBr].title)

  return (
    <div lang="pt-BR">
      <PrivacyPolicyView content={privacyPolicyContentPtBr} />
    </div>
  )
}

export default PrivacidadePage
