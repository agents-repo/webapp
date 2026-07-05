# Privacy and Analytics

This document describes how the webapp handles cookie consent, Google Consent
Mode v2, Google Tag Manager (GTM), and the public privacy policy pages.
It is a **contributor guide**, not legal advice. Policy copy in the app should
be reviewed by qualified counsel before launch or material changes.

## Public pages

| Route | Language | Source module |
| --- | --- | --- |
| `/privacy` | English | `privacyPolicyContent.en.ts` |
| `/privacidade` | Portuguese (Brazil) | `privacyPolicyContent.pt-BR.ts` |

Presentation:

- `PrivacyPage.tsx` — English page with cross-link to `/privacidade`
- `PrivacidadePage.tsx` — Portuguese page with `lang="pt-BR"` wrapper and
  cross-link to `/privacy`
- `PrivacyPolicyView.tsx` — shared card/table layout

Shared types live in `privacyPolicyContent.types.ts`. Both locales export the
same section structure (`privacyPolicyLastUpdated`, `privacyPolicySections`).

## Jurisdiction mapping

The banner and policy pages are structured to support common expectations in
Europe/UK (GDPR + ePrivacy), the United States (notice + opt-out), and Brazil
(LGPD):

| Topic | Implementation |
| --- | --- |
| Prior consent for analytics | GTM blocked until Accept; Consent Mode default-deny |
| Equal Accept / Reject | Same banner row, equal button prominence |
| Withdraw consent | Footer **Cookie preferences** re-opens the banner |
| Transparency | `/privacy` and `/privacidade` before choice |
| No advertising | Only `analytics_storage` granted; all `ad_*` stay denied |
| US opt-out | Reject and Cookie preferences → Reject |
| LGPD Portuguese notice | Dedicated `/privacidade` page |

## Analytics modules

Code lives in `src/modules/site/application/analytics/`:

| Module | Role |
| --- | --- |
| `analyticsEnvironment.ts` | `isProductionAnalyticsEnabled()` — `MODE === 'production'` |
| `cookieConsent.ts` | `analytics-consent` in `localStorage` (`accepted` / `rejected`) |
| `googleConsentMode.ts` | `gtag('consent', …)` grant/deny helpers |
| `googleTagManager.ts` | `resolveGtmContainerId()`, `loadGoogleTagManager()` |
| `analyticsPageView.ts` | `pushAnalyticsPageView()` — SPA `page_view` dataLayer events |
| `AnalyticsRouteTracker.tsx` | Pushes pageviews on client-side route changes |

UI:

- `CookieConsentProvider.tsx` — consent state and `openCookiePreferences()`
- `CookieConsentBanner.tsx` — banner with both policy links and Accept/Reject

## Production-only gate

Analytics runs only when **both** are true:

1. `import.meta.env.MODE === 'production'` (via `isProductionAnalyticsEnabled()`)
2. Stored consent is `accepted`

| Environment | `MODE` | GTM after Accept? |
| --- | --- | --- |
| `npm run dev` | `development` | No |
| `npm run build` / `build:pages` | `production` | Yes |
| `npm run build:pages:e2e` / Playwright | `e2e` | No |

Do **not** use `import.meta.env.PROD` for analytics — e2e builds set
`PROD=true` but `MODE=e2e`.

## Consent flow

1. `index.html` sets Consent Mode v2 default-deny before any Google tag loads.
2. First visit shows the cookie banner until Accept or Reject.
3. **Accept:** persist → grant `analytics_storage` only → load GTM (production
   only) → push current route `page_view`.
4. **Reject:** persist → deny all consent parameters → no GTM.
5. **Return visitor (accepted):** grant consent and load GTM on mount.

GTM is injected at runtime after consent — it is **not** in static HTML.

## Translation workflow

When updating policy copy:

1. Edit **both** `privacyPolicyContent.en.ts` and `privacyPolicyContent.pt-BR.ts`.
2. Keep section keys and legal coverage aligned — do not shorten PT sections.
3. Update `privacyPolicyLastUpdated` in both files.
4. Run locale content tests and page/a11y tests for both routes.
5. Coordinate legal review for EN and LGPD-fluent PT review for `/privacidade`.

Cookie table headers are localized via `cookieTableHeaders` on each content
object.

## localStorage keys documented in policy

| Key | Purpose | Consent required? |
| --- | --- | --- |
| `analytics-consent` | Remember Accept/Reject | No (required to store choice) |
| `theme` | Color mode preference | No (strictly necessary / preference) |
| Registry override keys | User-requested catalog source | No (functionality) |

See `cookieConsent.ts` and existing theme/registry modules for key names.

## Related docs

- [seo.md](seo.md) — GTM container checklist, `page_view` contract, History Change alternative
- [development.md](development.md) — `VITE_GTM_ID` env var
- [accessibility.md](accessibility.md) — banner accessibility requirements
- [deployment.md](deployment.md) — consent stub in built HTML
- [e2e-testing.md](e2e-testing.md) — e2e consent pre-seed
