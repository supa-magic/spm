type SkillEntry = {
  source: string
  version: number
}

type SkillsetEntry = {
  source: string
  version: number
}

type ProjectConfig = {
  provider: string
  skillset?: SkillsetEntry
  skills: Record<string, SkillEntry>
}

export type { ProjectConfig, SkillEntry, SkillsetEntry }
