type InstallInput = {
  downloadDir: string
  setupFile?: string
  providerDir: string
  skillsetName: string
  skillsetVersion: string
  source: string
  configPath: string
}

type InstallResult = {
  success: boolean
  output: string
  files: string[]
}

export type { InstallInput, InstallResult }
