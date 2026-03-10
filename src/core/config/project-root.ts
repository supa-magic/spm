import { execFileSync } from 'node:child_process'

const detectProjectRoot = (): string => {
  try {
    const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()

    return root
  } catch {
    return process.cwd()
  }
}

export { detectProjectRoot }
