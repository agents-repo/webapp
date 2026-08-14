/** Display size of `.person-card-avatar` (6rem at the 16px root). */
export const GITHUB_AVATAR_SIZE_PX = 96

export function githubProfileUrl(githubLogin: string): string {
  return `https://github.com/${githubLogin}`
}

export function githubAvatarUrl(githubLogin: string): string {
  return `https://github.com/${githubLogin}.png?size=${GITHUB_AVATAR_SIZE_PX}`
}
