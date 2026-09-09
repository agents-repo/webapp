import { privacyPolicyContentEn } from '../../application/privacy/privacyPolicyContent.en'
import { privacyPolicyContentEs } from '../../application/privacy/privacyPolicyContent.es'
import { privacyPolicyContentPtBr } from '../../application/privacy/privacyPolicyContent.pt-BR'
import { privacyPolicyContentPtPt } from '../../application/privacy/privacyPolicyContent.pt-PT'
import type { AppLocale } from '../../application/i18n/supportedLocales.ts'
import { useLocale } from '../../application/i18n/useLocale'
import type { PrivacyPolicyContent } from '../../application/privacy/privacyPolicyContent.types'
import PrivacyPolicyView from './PrivacyPolicyView'

function getPrivacyPolicyContent(locale: AppLocale): PrivacyPolicyContent {
  switch (locale) {
    case 'es':
      return privacyPolicyContentEs
    case 'pt-BR':
      return privacyPolicyContentPtBr
    case 'pt-PT':
      return privacyPolicyContentPtPt
    default:
      return privacyPolicyContentEn
  }
}

function PrivacyPage() {
  const { locale } = useLocale()
  const content = getPrivacyPolicyContent(locale)

  return <PrivacyPolicyView content={content} />
}

export default PrivacyPage
