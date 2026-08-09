export function getBrowserWindow(): Window | null {
  const globalScope = globalThis as typeof globalThis & { window?: Window }

  return globalScope.window ?? null
}

export function getBrowserDocument(): Document | null {
  const globalScope = globalThis as typeof globalThis & { document?: Document }

  return globalScope.document ?? null
}
