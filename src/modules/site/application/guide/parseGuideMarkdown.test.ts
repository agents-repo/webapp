import { describe, expect, it } from 'vitest'
import { readFrontmatterScalar, splitGuideMarkdown } from './parseGuideMarkdown.ts'

describe('parseGuideMarkdown', () => {
  it('splits frontmatter and body', () => {
    const raw = `---
title: Example
description: Short summary
order: 1
section: Start
---

Hello **world**.
`

    const { frontmatter, body } = splitGuideMarkdown(raw)
    expect(readFrontmatterScalar(frontmatter, 'title')).toBe('Example')
    expect(body).toBe('Hello **world**.')
  })
})
