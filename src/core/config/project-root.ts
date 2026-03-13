import { execSync } from 'node:child_process'

const getGitRoot = (): string | undefined => {
  try {
    return execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim()
  } catch {
    return undefined
  }
}

const getProjectRoot = (): string =>
  getGitRoot() ?? process.cwd()

export { getProjectRoot }
