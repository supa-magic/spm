import type { EmbeddedFile } from './shared/collect-files'

type EmbeddedContext = {
  downloadedFiles: EmbeddedFile[]
  existingFiles: string[]
}

type PackageInstallInput = {
  providerDir: string
  installDir: string
  packageName: string
  packageVersion: string
  packageType: string
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

export type {
  EmbeddedContext,
  InstallResult,
  PackageInstallInput,
  SkillInstallInput,
}
