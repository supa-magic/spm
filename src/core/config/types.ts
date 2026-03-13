type Provider = {
  path: string
  skillsets?: Record<string, string>
  skills?: Record<string, string>
  agents?: string[]
  hooks?: string[]
  mcp?: string[]
  memory?: string[]
  rules?: string[]
  'local-files'?: string[]
}

type ProjectConfig = {
  version: number
  providers: Record<string, Provider>
}

export type { ProjectConfig, Provider }
