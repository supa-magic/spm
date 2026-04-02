import type { ProjectConfig } from './types'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse, stringify } from 'yaml'
import { detectProviders } from './detect-providers'
import { getProjectRoot } from './project-root'

const CONFIG_FILE = '.spm.yml'

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

type AddEntryParams = {
  providerPath: string
  kind: 'skills' | 'hooks' | 'agents' | 'rules'
  name: string
  source: string
}

const addConfigEntry = ({
  providerPath,
  kind,
  name,
  source,
}: AddEntryParams): void => {
  const { config } = readConfig()
  const provider = Object.values(config.providers).find(
    (p) => p.path === providerPath,
  )

  if (!provider) {
    throw new Error(`Provider with path "${providerPath}" not found in config`)
  }

  if (!provider[kind]) {
    provider[kind] = {}
  }
  provider[kind][name] = source
  writeConfig(config)
}

type RemoveEntryParams = {
  providerPath: string
  kind: 'skills' | 'hooks' | 'agents' | 'rules'
  name: string
}

const removeConfigEntry = ({
  providerPath,
  kind,
  name,
}: RemoveEntryParams): void => {
  const { config } = readConfig()
  const provider = Object.values(config.providers).find(
    (p) => p.path === providerPath,
  )

  if (!provider) {
    throw new Error(`Provider with path "${providerPath}" not found in config`)
  }

  const entries = provider[kind]
  if (!entries || !(name in entries)) return

  delete entries[name]

  if (Object.keys(entries).length === 0) {
    delete provider[kind]
  }

  writeConfig(config)
}

export {
  addConfigEntry,
  CONFIG_FILE,
  createDefaultConfig,
  getConfigPath,
  readConfig,
  removeConfigEntry,
  writeConfig,
}
