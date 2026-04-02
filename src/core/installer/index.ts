export type {
  EmbeddedContext,
  InstallResult,
  PackageInstallInput,
} from './types'
export { installPackageFlow } from './install-package'
export { installSkillFlow } from './install-skill'
export { pruneUnchanged } from './prune-unchanged'
export { buildPackageInstructions } from './shared'
export { spawnClaude } from './spawn-claude'
