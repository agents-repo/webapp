import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../../../test/renderWithProviders.tsx'
import { GITHUB_AVATAR_SIZE_PX, githubAvatarUrl, githubProfileUrl } from '../../application/people/githubPersonUrls.ts'
import { listMaintainers } from '../../application/people/peopleManifest.ts'
import { getRepositoryBySlug } from '../../application/repositories/repositoryManifest.ts'
import { getRepositoryDetailPath } from '../../application/nestedSiteRoutes.ts'
import { siteRoutes } from '../routes/siteRoutes.ts'
import CommunityPage from './CommunityPage.tsx'

describe('CommunityPage', () => {
  it('renders maintainers, GitHub avatar and profile, project tags, and empty contributors', () => {
    renderWithProviders(<CommunityPage />, { initialEntries: [siteRoutes.community] })

    expect(screen.getByRole('heading', { name: 'Community', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Maintainers', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Contributors', level: 2 })).toBeInTheDocument()

    const maintainer = listMaintainers()[0]
    expect(maintainer).toBeDefined()
    if (!maintainer) {
      throw new Error('Expected a maintainer in the people manifest')
    }

    expect(screen.getByRole('heading', { name: maintainer.displayName })).toBeInTheDocument()
    const avatar = screen.getByAltText(maintainer.displayName)
    expect(avatar).toHaveAttribute('src', githubAvatarUrl(maintainer.githubLogin))
    expect(avatar).toHaveAttribute('width', String(GITHUB_AVATAR_SIZE_PX))
    expect(avatar).toHaveAttribute('height', String(GITHUB_AVATAR_SIZE_PX))
    expect(
      screen.getByRole('link', { name: `${maintainer.displayName} on GitHub (opens in a new tab)` }),
    ).toHaveAttribute('href', githubProfileUrl(maintainer.githubLogin))

    for (const project of maintainer.projects) {
      const repository = getRepositoryBySlug(project.repositorySlug)
      expect(repository).toBeDefined()
      if (!repository) {
        continue
      }

      expect(
        screen.getByRole('link', { name: `${repository.name} · ${project.role}` }),
      ).toHaveAttribute('href', getRepositoryDetailPath(project.repositorySlug))
    }

    expect(screen.getByText(/We don't have any contributor yet/)).toBeInTheDocument()
    const helpUsLinks = screen.getAllByRole('link', { name: 'Help Us' })
    expect(helpUsLinks.length).toBeGreaterThanOrEqual(1)
    for (const link of helpUsLinks) {
      expect(link).toHaveAttribute('href', siteRoutes.helpUs)
    }
  })
})
