import type { ParsedIdentifier, SkillIdentifier } from './types'

const detectKind = (path: string): ParsedIdentifier['kind'] =>
  path.endsWith('.md') ? 'skill' : 'skillset'

const parseGitHubUrl = (url: string): ParsedIdentifier | undefined => {
  const blobOrTree = url.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:tree|blob)\/[^/]+\/(.+)$/,
  )
  if (blobOrTree) {
    const identifier: SkillIdentifier = {
      owner: blobOrTree[1],
      repository: blobOrTree[2],
      path: blobOrTree[3],
    }
    return { kind: detectKind(identifier.path), identifier }
  }

  const raw = url.match(
    /^https?:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/[^/]+\/(.+)$/,
  )
  if (raw) {
    const identifier: SkillIdentifier = {
      owner: raw[1],
      repository: raw[2],
      path: raw[3],
    }
    return { kind: detectKind(identifier.path), identifier }
  }

  return undefined
}

const parseAtIdentifier = (input: string): ParsedIdentifier => {
  const parts = input.slice(1).split('/').filter(Boolean)

  if (parts.length < 3) {
    throw new Error(
      `Invalid identifier "${input}". Expected format: @owner/repo/path (e.g., @supa-magic/skillbox/claude/fsd).`,
    )
  }

  const identifier: SkillIdentifier = {
    owner: parts[0],
    repository: parts[1],
    path: parts.slice(2).join('/'),
  }

  return { kind: detectKind(identifier.path), identifier }
}

const parseIdentifier = (input: string): ParsedIdentifier => {
  const trimmed = input.trim()

  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    const result = parseGitHubUrl(trimmed)
    if (!result) {
      throw new Error(
        `Invalid GitHub URL "${trimmed}". Expected format: https://github.com/owner/repo/tree/branch/path or https://raw.githubusercontent.com/owner/repo/ref/path.`,
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
