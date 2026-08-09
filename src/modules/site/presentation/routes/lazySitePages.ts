import { lazy, type LazyExoticComponent, type ComponentType } from 'react'

export interface LazySitePages {
  readonly AboutPage: LazyExoticComponent<ComponentType>
  readonly AccessibilityPage: LazyExoticComponent<ComponentType>
  readonly ContactPage: LazyExoticComponent<ComponentType>
  readonly HelpUsPage: LazyExoticComponent<ComponentType>
  readonly PrivacyPage: LazyExoticComponent<ComponentType>
  readonly PrivacidadePage: LazyExoticComponent<ComponentType>
  readonly RepositoriesIndexPage: LazyExoticComponent<ComponentType>
  readonly GuideArticlePage: LazyExoticComponent<ComponentType>
  readonly GuideIndexPage: LazyExoticComponent<ComponentType>
  readonly RepositoryDetailPage: LazyExoticComponent<ComponentType>
}

export function createLazySitePages(): LazySitePages {
  return {
    AboutPage: lazy(() => import('../pages/AboutPage')),
    AccessibilityPage: lazy(() => import('../pages/AccessibilityPage')),
    ContactPage: lazy(() => import('../pages/ContactPage')),
    HelpUsPage: lazy(() => import('../pages/HelpUsPage')),
    PrivacyPage: lazy(() => import('../pages/PrivacyPage')),
    PrivacidadePage: lazy(() => import('../pages/PrivacidadePage')),
    RepositoriesIndexPage: lazy(() => import('../pages/RepositoriesIndexPage')),
    GuideArticlePage: lazy(() => import('../pages/guide/GuideArticlePage')),
    GuideIndexPage: lazy(() => import('../pages/guide/GuideIndexPage')),
    RepositoryDetailPage: lazy(() => import('../pages/RepositoryDetailPage')),
  }
}
