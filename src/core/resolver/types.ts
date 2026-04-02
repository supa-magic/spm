type SkillIdentifier = {
  owner: string
  repository: string
  path: string
  ref?: string
}

type PackageType = 'skills' | 'hooks' | 'agents' | 'rules'

type ManifestComponent = {
  source: string
  files: string[]
}

type Manifest = {
  name: string
  version: string
  description: string
  license?: string
  compatibility?: string[]
  requires?: string[]
  setup?: string | Record<string, string>
  skills?: Record<string, ManifestComponent>
  hooks?: Record<string, ManifestComponent>
  agents?: string[]
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
  type: PackageType | 'setup'
}

type ParsedIdentifier =
  | { kind: 'package'; identifier: SkillIdentifier }
  | { kind: 'skill'; identifier: SkillIdentifier }

type ResolvedSkill = {
  name: string
  location: ResolvedLocation
  files: Array<{ path: string; content: string | Buffer }>
  unresolvedRefs: string[]
  setupContent?: string
}

export type {
  FileEntry,
  Manifest,
  ManifestComponent,
  PackageType,
  ParsedIdentifier,
  ResolvedLocation,
  ResolvedSkill,
  SkillIdentifier,
}
