/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GTM_ID?: string
  readonly VITE_SITE_URL?: string
  readonly VITE_REGISTRY_REPOSITORY_URL?: string
  readonly VITE_REGISTRY_BASE_URL?: string
  readonly VITE_REGISTRY_INDEX_PATH?: string
  readonly VITE_REGISTRY_GITHUB_REPOSITORY_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
