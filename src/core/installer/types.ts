type InstallInput = {
  downloadDir: string
  setupFile?: string
  providerDir: string
  skillsetName: string
  skillsetVersion: string
  source: string
  configPath: string
  model?: string
}

type InstallResult = {
  success: boolean
  output: string
  files: string[]
}

type SkillInstallInput = {
  downloadDir: string
  providerDir: string
  skillName: string
  source: string
  configPath: string
  model?: string
}

export type { InstallInput, InstallResult, SkillInstallInput }
