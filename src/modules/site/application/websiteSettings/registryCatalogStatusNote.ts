export interface RegistryRefResolutionNote {
  readonly alias: string
  readonly resolvedRef: string
}

export interface RegistryCatalogStatusNote {
  readonly summaryText: string
  readonly sourceUrl: string
  readonly statusTag: string
  readonly baseUrlRefResolution?: RegistryRefResolutionNote | null
  readonly githubRepositoryRefResolution?: RegistryRefResolutionNote | null
}
