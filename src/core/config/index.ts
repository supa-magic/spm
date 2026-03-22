export type { ProjectConfig, Provider } from './types'
export { detectProviders, knownProviders } from './detect-providers'
export { getProjectRoot } from './project-root'
export {
  addConfigEntry,
  CONFIG_FILE,
  createDefaultConfig,
  getConfigPath,
  readConfig,
  removeConfigEntry,
  writeConfig,
} from './spmrc'
