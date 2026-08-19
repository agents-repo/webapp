import type { ReactNode } from 'react'

interface PackageMarkdownYamlTableProps {
  readonly data: Readonly<Record<string, unknown>>
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const isMappingArray = (value: readonly unknown[]): value is readonly Record<string, unknown>[] => {
  return value.length > 0 && value.every((item) => isPlainObject(item))
}

const mappingArrayKeys = (items: readonly Record<string, unknown>[]): readonly string[] => {
  const keys: string[] = []
  const seen = new Set<string>()

  for (const item of items) {
    for (const key of Object.keys(item)) {
      if (seen.has(key)) {
        continue
      }

      seen.add(key)
      keys.push(key)
    }
  }

  return keys
}

const scalarText = (value: unknown): string => {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  return ''
}

const serializeYamlTableRow = (value: unknown): string => {
  if (value === undefined) {
    return 'undefined'
  }

  try {
    return JSON.stringify(value)
  } catch {
    return scalarText(value) || Object.prototype.toString.call(value)
  }
}

const keyedYamlTableRows = <T,>(
  items: readonly T[],
): readonly { readonly item: T; readonly key: string }[] => {
  const seen = new Map<string, number>()

  return items.map((item) => {
    const serialized = serializeYamlTableRow(item)
    const occurrence = seen.get(serialized) ?? 0
    seen.set(serialized, occurrence + 1)
    return { item, key: `${serialized}:${occurrence}` }
  })
}

function PackageYamlValue({ value }: { readonly value: unknown }): ReactNode {
  if (value === null || value === undefined) {
    return null
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return null
    }

    if (isMappingArray(value)) {
      return <PackageYamlMappingArrayTable items={value} />
    }

    return <PackageYamlPrimitiveArrayTable items={value} />
  }

  if (isPlainObject(value)) {
    return <PackageYamlMappingTable data={value} />
  }

  const text = scalarText(value)
  if (text === '') {
    return null
  }

  return <>{text}</>
}

function PackageYamlMappingTable({ data }: { readonly data: Readonly<Record<string, unknown>> }) {
  const entries = Object.entries(data)
  if (entries.length === 0) {
    return null
  }

  return (
    <table>
      <tbody>
        {entries.map(([key, nested]) => (
          <tr key={key}>
            <th scope="row">{key}</th>
            <td>
              <PackageYamlValue value={nested} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PackageYamlMappingArrayTable({ items }: { readonly items: readonly Record<string, unknown>[] }) {
  const keys = mappingArrayKeys(items)
  if (keys.length === 0) {
    return null
  }

  return (
    <table>
      <thead>
        <tr>
          {keys.map((key) => (
            <th key={key} scope="col">
              {key}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {keyedYamlTableRows(items).map(({ item, key }) => (
          <tr key={key}>
            {keys.map((columnKey) => (
              <td key={columnKey}>
                <PackageYamlValue value={item[columnKey]} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PackageYamlPrimitiveArrayTable({ items }: { readonly items: readonly unknown[] }) {
  return (
    <table>
      <tbody>
        {keyedYamlTableRows(items).map(({ item, key }) => (
          <tr key={key}>
            <td>
              <PackageYamlValue value={item} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function PackageMarkdownYamlTable({ data }: PackageMarkdownYamlTableProps) {
  return <PackageYamlMappingTable data={data} />
}

export default PackageMarkdownYamlTable
