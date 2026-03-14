import type { SkillIdentifier } from './types'

const parseIdentifier = (input: string): SkillIdentifier => {
  const trimmed = input.trim()

  if (!trimmed.startsWith('@')) {
    throw new Error(
      `Invalid identifier "${trimmed}". Must start with @ (e.g., @supa-magic/skillbox/claude/fsd).`,
    )
  }

  const parts = trimmed.slice(1).split('/')

  if (parts.length < 3) {
    throw new Error(
      `Invalid identifier "${trimmed}". Expected format: @owner/repo/path (e.g., @supa-magic/skillbox/claude/fsd).`,
    )
  }

  return {
    owner: parts[0],
    repository: parts[1],
    path: parts.slice(2).join('/'),
  }
}

export { parseIdentifier }
