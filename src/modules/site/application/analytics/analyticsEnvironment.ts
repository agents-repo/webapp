export function isProductionAnalyticsEnabled(): boolean {
  return import.meta.env.MODE === 'production'
}
