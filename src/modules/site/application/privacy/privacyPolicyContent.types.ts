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

export interface PrivacyPolicyContent {
  readonly pageTitle: string
  readonly languageLinkLabel: string
  readonly languageLinkPath: string
  readonly lastUpdatedLabel: string
  readonly lastUpdated: string
  readonly contactLinkLabel: string
  readonly cookieTableHeaders: PrivacyPolicyTableHeaders
  readonly sections: readonly PrivacyPolicySection[]
}
