import { privacyPolicyContentPtBr } from '../../application/privacy/privacyPolicyContent.pt-BR'
import PrivacyPolicyView from './PrivacyPolicyView'

function PrivacidadePage() {
  return (
    <div lang="pt-BR">
      <PrivacyPolicyView content={privacyPolicyContentPtBr} />
    </div>
  )
}

export default PrivacidadePage
