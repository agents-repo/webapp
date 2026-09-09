import { getDocBySlug } from './docsManifest.ts'
import { registerDocPageMetaResolver } from './docsPageMeta.ts'

registerDocPageMetaResolver((slug, locale) => {
  const doc = getDocBySlug(slug, locale)
  if (!doc) {
    return undefined
  }

  return {
    title: doc.title,
    description: doc.description,
  }
})
