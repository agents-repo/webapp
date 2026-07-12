import { lazy, type LazyExoticComponent, type ComponentType } from 'react'

export interface LazySitePages {
  readonly AboutPage: LazyExoticComponent<ComponentType>
  readonly AccessibilityPage: LazyExoticComponent<ComponentType>
  readonly ContactPage: LazyExoticComponent<ComponentType>
  readonly HelpUsPage: LazyExoticComponent<ComponentType>
  readonly PrivacyPage: LazyExoticComponent<ComponentType>
  readonly PrivacidadePage: LazyExoticComponent<ComponentType>
}

export function createLazySitePages(): LazySitePages {
  return {
    AboutPage: lazy(() => import('../pages/AboutPage')),
    AccessibilityPage: lazy(() => import('../pages/AccessibilityPage')),
    ContactPage: lazy(() => import('../pages/ContactPage')),
    HelpUsPage: lazy(() => import('../pages/HelpUsPage')),
    PrivacyPage: lazy(() => import('../pages/PrivacyPage')),
    PrivacidadePage: lazy(() => import('../pages/PrivacidadePage')),
  }
}
