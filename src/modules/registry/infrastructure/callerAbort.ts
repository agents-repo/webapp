export const abortError = (): DOMException => {
  return new DOMException('The operation was aborted.', 'AbortError')
}

export const settleWithCallerSignal = async <T>(
  value: Promise<T> | T,
  signal?: AbortSignal,
): Promise<T> => {
  if (signal?.aborted) {
    throw abortError()
  }

  if (!(value instanceof Promise)) {
    return value
  }

  if (!signal) {
    return value
  }

  return new Promise<T>((resolve, reject) => {
    const onAbort = (): void => {
      signal.removeEventListener('abort', onAbort)
      reject(abortError())
    }

    signal.addEventListener('abort', onAbort, { once: true })

    value.then(
      (resolved) => {
        signal.removeEventListener('abort', onAbort)
        resolve(resolved)
      },
      (error: unknown) => {
        signal.removeEventListener('abort', onAbort)
        reject(error instanceof Error ? error : new Error(String(error)))
      },
    )
  })
}
