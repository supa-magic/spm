import type { ProjectConfig } from './types'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse, stringify } from 'yaml'
import { detectProviders } from './detect-providers'
import { getProjectRoot } from './project-root'

const CONFIG_FILE = '.spmrc.yml'

const getConfigPath = (root?: string): string =>
  join(root ?? getProjectRoot(), CONFIG_FILE)

const createDefaultConfig = (root: string): ProjectConfig => ({
  version: 1,
  providers: detectProviders(root),
})

type ReadConfigResult = {
  config: ProjectConfig
  created: boolean
}

const readConfig = (root?: string): ReadConfigResult => {
  const resolvedRoot = root ?? getProjectRoot()
  const configPath = getConfigPath(resolvedRoot)

  if (!existsSync(configPath)) {
    const config = createDefaultConfig(resolvedRoot)
    writeConfig(config, resolvedRoot)
    return { config, created: true }
  }

  const content = readFileSync(configPath, 'utf-8')
  return { config: parse(content), created: false }
}

const writeConfig = (config: ProjectConfig, root?: string): void => {
  const configPath = getConfigPath(root)
  writeFileSync(configPath, stringify(config), 'utf-8')
}

export {
  CONFIG_FILE,
  createDefaultConfig,
  getConfigPath,
  readConfig,
  writeConfig,
}
