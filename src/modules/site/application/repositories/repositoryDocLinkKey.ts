export function getRepositoryDocLinkKey(path: string): string {
  return path.replace(/^\/docs\//, '')
}
