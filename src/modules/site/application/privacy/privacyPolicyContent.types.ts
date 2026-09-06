export interface PrivacyPolicyCookieRow {
  readonly name: string
  readonly purpose: string
  readonly storage: string
  readonly duration: string
  readonly consentRequired: string
}

export interface PrivacyPolicySection {
  readonly id: string
  readonly title: string
  readonly paragraphs?: readonly string[]
  readonly listItems?: readonly string[]
  readonly cookieRows?: readonly PrivacyPolicyCookieRow[]
}

export interface PrivacyPolicyTableHeaders {
  readonly name: string
  readonly purpose: string
  readonly storage: string
  readonly duration: string
  readonly consentRequired: string
}

export interface PrivacyPolicyLanguageLink {
  readonly label: string
  readonly locale: string
}

export interface PrivacyPolicyContent {
  readonly pageTitle: string
  readonly languageLinks: readonly PrivacyPolicyLanguageLink[]
  readonly lastUpdatedLabel: string
  readonly lastUpdated: string
  readonly contactLinkLabel: string
  readonly cookieTableHeaders: PrivacyPolicyTableHeaders
  readonly sections: readonly PrivacyPolicySection[]
}
