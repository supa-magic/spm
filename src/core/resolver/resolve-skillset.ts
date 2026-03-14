import type { FileEntry, ResolvedLocation, Skillset } from './types'

const resolveSkillSource = (
  source: string,
  location: ResolvedLocation,
): { owner: string; repository: string; basePath: string } => {
  if (source.startsWith('./')) {
    const skillsetDir = location.path.replace(/\/skillset\.yml$/, '')
    return {
      owner: location.owner,
      repository: location.repository,
      basePath: `${skillsetDir}/${source.slice(2)}`,
    }
  }

  if (source.startsWith('@')) {
    const parts = source.slice(1).split('/')
    if (parts.length < 3) {
      throw new Error(
        `Invalid cross-repo source "${source}". Expected format: @owner/repo/path.`,
      )
    }
    return {
      owner: parts[0],
      repository: parts[1],
      basePath: parts.slice(2).join('/'),
    }
  }

  throw new Error(
    `Invalid skill source "${source}". Use ./relative/path for same repo or @owner/repo/path for cross-repo.`,
  )
}

const resolveSkillset = (
  skillset: Skillset,
  location: ResolvedLocation,
): FileEntry[] => {
  const entries: FileEntry[] = []
  const skillsetDir = location.path.replace(/\/skillset\.yml$/, '')

  if (skillset.setup) {
    entries.push({
      owner: location.owner,
      repository: location.repository,
      path: `${skillsetDir}/${skillset.setup}`,
      type: 'setup',
    })
  }

  if (skillset.skills) {
    Object.values(skillset.skills).forEach(({ source, files }) => {
      const resolved = resolveSkillSource(source, location)
      files.forEach((file) => {
        entries.push({
          owner: resolved.owner,
          repository: resolved.repository,
          path: `${resolved.basePath}/${file}`,
          type: 'skill',
        })
      })
    })
  }

  const localFileTypes = ['agents', 'hooks', 'mcp', 'memory', 'rules'] as const

  const typeMap: Record<(typeof localFileTypes)[number], FileEntry['type']> = {
    agents: 'agent',
    hooks: 'hook',
    mcp: 'mcp',
    memory: 'memory',
    rules: 'rule',
  }

  localFileTypes.forEach((key) => {
    const files = skillset[key]
    if (files) {
      files.forEach((file) => {
        entries.push({
          owner: location.owner,
          repository: location.repository,
          path: `${skillsetDir}/${file}`,
          type: typeMap[key],
        })
      })
    }
  })

  return entries
}

export { resolveSkillset, resolveSkillSource }
