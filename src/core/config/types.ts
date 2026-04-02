type Provider = {
  path: string
  skills?: Record<string, string>
  hooks?: Record<string, string>
  agents?: Record<string, string>
  rules?: Record<string, string>
  'local-files'?: string[]
}

type ProjectConfig = {
  version: number
  providers: Record<string, Provider>
}

export type { ProjectConfig, Provider }
