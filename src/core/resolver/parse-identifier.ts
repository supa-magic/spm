import type { SkillIdentifier } from './types'

const parseGitHubUrl = (url: string): SkillIdentifier | undefined => {
  const match = url.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/[^/]+\/(.+)$/,
  )
  if (!match) return undefined
  return { owner: match[1], repository: match[2], path: match[3] }
}

const parseAtIdentifier = (input: string): SkillIdentifier => {
  const parts = input.slice(1).split('/').filter(Boolean)

  if (parts.length < 3) {
    throw new Error(
      `Invalid identifier "${input}". Expected format: @owner/repo/path (e.g., @supa-magic/skillbox/claude/fsd).`,
    )
  }

  return {
    owner: parts[0],
    repository: parts[1],
    path: parts.slice(2).join('/'),
  }
}

const parseIdentifier = (input: string): SkillIdentifier => {
  const trimmed = input.trim()

  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    const result = parseGitHubUrl(trimmed)
    if (!result) {
      throw new Error(
        `Invalid GitHub URL "${trimmed}". Expected format: https://github.com/owner/repo/tree/branch/path.`,
      )
    }
    return result
  }

  if (!trimmed.startsWith('@')) {
    throw new Error(
      `Invalid identifier "${trimmed}". Must start with @ or be a GitHub URL.`,
    )
  }

  return parseAtIdentifier(trimmed)
}

export { parseIdentifier }
