import type { Provider } from './types'
import { execFileSync } from 'node:child_process'
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

const cliCommands: Record<string, string> = {
  claude: 'claude',
  aider: 'aider',
}

const hasCliInstalled = (command: string): boolean => {
  try {
    execFileSync(command, ['--version'], {
      stdio: 'ignore',
      timeout: 5_000,
      shell: process.platform === 'win32',
    })
    return true
  } catch {
    return false
  }
}

const detectProviders = (root: string): Record<string, Provider> =>
  Object.entries(knownProviders).reduce<Record<string, Provider>>(
    (providers, [name, path]) => {
      const hasDir = existsSync(join(root, path))
      const cli = cliCommands[name]
      const hasCli = cli ? hasCliInstalled(cli) : false

      if (hasDir || hasCli) {
        providers[name] = { path }
      }
      return providers
    },
    {},
  )

export { detectProviders, knownProviders }
