/**
 * Route OG artifact manifest. Public paths MUST stay aligned with
 * `routeOgImagePathByCanonicalPath` in `src/modules/site/application/seo/siteSeo.ts`.
 */
export const ROUTE_OG_ARTIFACTS = [
  { id: 'home', jpegFile: 'home.jpg', cardModule: './home-card.mjs' },
  { id: 'packages', jpegFile: 'packages.jpg', cardModule: './packages-card.mjs' },
  { id: 'docs', jpegFile: 'docs.jpg', cardModule: './docs-card.mjs' },
]

/** Template `.mjs` files fingerprinted for route OG drift (excluding site-default). */
export const ROUTE_OG_TEMPLATE_BASENAMES = [
  'constants.mjs',
  'render-lib.mjs',
  'route-card-layout.mjs',
  'home-card.mjs',
  'packages-card.mjs',
  'docs-card.mjs',
  'render-route-og.mjs',
  'routes.mjs',
]
