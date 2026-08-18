import { describe, expect, it } from 'vitest'
import { parsePackageMarkdownFrontmatter } from './packageMarkdownFrontmatter'

const closedFrontmatter = (yaml: string, body: string): string => {
  return `---\n${yaml}\n---\n\n${body}`
}

describe('parsePackageMarkdownFrontmatter', () => {
  it('returns the original markdown when frontmatter is absent', () => {
    const raw = '# Overview\n\nHello'

    expect(parsePackageMarkdownFrontmatter(raw)).toEqual({ data: null, body: raw })
  })

  it('parses a closed mapping and returns the markdown body', () => {
    const raw = closedFrontmatter('name: ai-first-chat\nversion: 1.0.0', '# Overview\n\nHello')

    expect(parsePackageMarkdownFrontmatter(raw)).toEqual({
      data: { name: 'ai-first-chat', version: '1.0.0' },
      body: '# Overview\n\nHello',
    })
  })

  it('parses nested inputs and outputs arrays', () => {
    const raw = closedFrontmatter(
      [
        'name: ai-first-chat',
        'inputs:',
        '  - name: user-message',
        '    type: string',
        '    description: The user question.',
        'outputs:',
        '  - name: reply',
        '    type: string',
        '    description: Conversational reply.',
      ].join('\n'),
      '# Overview',
    )

    expect(parsePackageMarkdownFrontmatter(raw)).toEqual({
      data: {
        name: 'ai-first-chat',
        inputs: [{ name: 'user-message', type: 'string', description: 'The user question.' }],
        outputs: [{ name: 'reply', type: 'string', description: 'Conversational reply.' }],
      },
      body: '# Overview',
    })
  })

  it('accepts CRLF closed fences', () => {
    const raw = '---\r\nname: sample-agent\r\n---\r\n\r\n# Overview'

    expect(parsePackageMarkdownFrontmatter(raw)).toEqual({
      data: { name: 'sample-agent' },
      body: '# Overview',
    })
  })

  it('returns the original markdown when the closing fence is missing', () => {
    const raw = '---\nname: ai-first-chat\n\n# Overview'

    expect(parsePackageMarkdownFrontmatter(raw)).toEqual({ data: null, body: raw })
  })

  it('returns the original markdown when YAML is invalid', () => {
    const raw = closedFrontmatter('name: [unterminated', '# Overview')

    expect(parsePackageMarkdownFrontmatter(raw)).toEqual({ data: null, body: raw })
  })

  it('returns the original markdown when the YAML root is not a mapping', () => {
    const listRoot = closedFrontmatter('- name: user-message', '# Overview')
    const scalarRoot = closedFrontmatter('just-a-string', '# Overview')

    expect(parsePackageMarkdownFrontmatter(listRoot)).toEqual({ data: null, body: listRoot })
    expect(parsePackageMarkdownFrontmatter(scalarRoot)).toEqual({ data: null, body: scalarRoot })
  })

  it('strips empty frontmatter without rendering data', () => {
    const raw = '---\n---\n\n# Overview'

    expect(parsePackageMarkdownFrontmatter(raw)).toEqual({ data: null, body: '# Overview' })
  })

  it('strips an empty mapping without rendering data', () => {
    const raw = closedFrontmatter('{}', '# Overview')

    expect(parsePackageMarkdownFrontmatter(raw)).toEqual({ data: null, body: '# Overview' })
  })

  it('keeps YAML 1.2 so no stays a string', () => {
    const raw = closedFrontmatter('flag: no', '# Overview')

    expect(parsePackageMarkdownFrontmatter(raw)).toEqual({
      data: { flag: 'no' },
      body: '# Overview',
    })
  })
})
