import { describe, expect, it } from 'vitest'
import { readFrontmatterScalar, splitDocMarkdown } from './parseDocMarkdown.ts'

describe('parseDocMarkdown', () => {
  it('splits frontmatter and body', () => {
    const raw = `---
title: Example
description: Short summary
order: 1
section: Start
---

Hello **world**.
`

    const { frontmatter, body } = splitDocMarkdown(raw)
    expect(readFrontmatterScalar(frontmatter, 'title')).toBe('Example')
    expect(body).toBe('Hello **world**.')
  })
})
