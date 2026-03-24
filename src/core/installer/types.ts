import type { EmbeddedFile } from './shared/collect-files'

type EmbeddedContext = {
  downloadedFiles: EmbeddedFile[]
  existingFiles: string[]
}

type InstallInput = {
  setupContent?: string
  providerDir: string
  skillsetName: string
  skillsetVersion: string
  source: string
  configPath: string
  model?: string
  embedded: EmbeddedContext
}

type InstallResult = {
  success: boolean
  output: string
  files: string[]
}

type SkillInstallInput = {
  providerDir: string
  skillName: string
  source: string
  configPath: string
  model?: string
  unresolvedRefs?: string[]
  embedded: EmbeddedContext
}

export type { EmbeddedContext, InstallInput, InstallResult, SkillInstallInput }
