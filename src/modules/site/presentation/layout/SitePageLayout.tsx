import type { ReactNode } from 'react'
import { Container, Stack } from 'react-bootstrap'

interface SitePageLayoutProps {
  readonly title: string
  readonly children: ReactNode
}

function SitePageLayout({ title, children }: SitePageLayoutProps) {
  return (
    <div className="py-5">
      <Container>
        <h1 className="h2 mb-4">{title}</h1>
        <Stack gap={4}>{children}</Stack>
      </Container>
    </div>
  )
}

export default SitePageLayout
