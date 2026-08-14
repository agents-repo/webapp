export function githubProfileUrl(githubLogin: string): string {
  return `https://github.com/${githubLogin}`
}

export function githubAvatarUrl(githubLogin: string): string {
  return `https://github.com/${githubLogin}.png?size=160`
}
