import type { Provider } from './types'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const knownProviders: Record<string, string> = {
  claude: '.claude',
  cursor: '.cursor/rules',
  copilot: '.copilot',
  aider: '.aider',
  codeium: '.codeium',
  cody: '.cody',
}

const detectProviders = (root: string): Record<string, Provider> =>
  Object.entries(knownProviders).reduce<Record<string, Provider>>(
    (providers, [name, path]) => {
      const fullPath = join(root, path)
      if (existsSync(fullPath)) {
        providers[name] = { path }
      }
      return providers
    },
    {},
  )

export { detectProviders, knownProviders }
