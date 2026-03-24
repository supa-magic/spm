type SkillIdentifier = {
  owner: string
  repository: string
  path: string
  ref?: string
}

type Skillset = {
  name: string
  version: string
  description: string
  provider: string
  setup?: string
  skills?: Record<string, { source: string; files: string[] }>
  agents?: string[]
  hooks?: string[]
  mcp?: string[]
  memory?: string[]
  rules?: string[]
}

type ResolvedLocation = {
  owner: string
  repository: string
  path: string
  ref: string
}

type FileEntry = {
  owner: string
  repository: string
  path: string
  type: 'skill' | 'agent' | 'hook' | 'mcp' | 'memory' | 'rule' | 'setup'
  skillName?: string
}

type ParsedIdentifier =
  | { kind: 'skillset'; identifier: SkillIdentifier }
  | { kind: 'skill'; identifier: SkillIdentifier }

type ResolvedSkill = {
  name: string
  location: ResolvedLocation
  files: Array<{ path: string; content: string }>
  unresolvedRefs: string[]
}

export type {
  FileEntry,
  ParsedIdentifier,
  ResolvedLocation,
  ResolvedSkill,
  SkillIdentifier,
  Skillset,
}
