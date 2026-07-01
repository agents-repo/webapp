import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { isKnownSiteRoute } from '../../presentation/routes/siteRoutes.ts'
import { getRouteHeadData } from './buildRouteHead.ts'

function SiteHead() {
  const { pathname } = useLocation()

  if (!isKnownSiteRoute(pathname)) {
    return (
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
    )
  }

  const head = getRouteHeadData(pathname)

  return (
    <Helmet>
      <meta name="description" content={head.description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={head.canonicalUrl} />
      <meta property="og:url" content={head.ogUrl} />
      <meta property="og:title" content={head.ogTitle} />
      <meta property="og:description" content={head.ogDescription} />
      <meta property="og:image" content={head.ogImage} />
      <meta property="og:image:width" content={String(head.ogImageWidth)} />
      <meta property="og:image:height" content={String(head.ogImageHeight)} />
      <meta property="og:image:alt" content={head.ogImageAlt} />
      <meta property="og:type" content={head.ogType} />
      <meta property="og:site_name" content={head.ogSiteName} />
      <meta property="og:locale" content={head.ogLocale} />
      <meta name="twitter:card" content={head.twitterCard} />
      <meta name="twitter:title" content={head.twitterTitle} />
      <meta name="twitter:description" content={head.twitterDescription} />
      <meta name="twitter:image" content={head.twitterImage} />
      <script type="application/ld+json">{JSON.stringify(head.jsonLd)}</script>
    </Helmet>
  )
}

export default SiteHead
