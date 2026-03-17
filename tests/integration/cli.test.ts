import { execFile } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const dir = fileURLToPath(new URL('.', import.meta.url))
const cli = resolve(dir, '../../dist/bin/spm.js')

const run = (...args: string[]) =>
  new Promise<{ stdout: string; stderr: string; code: number }>((res) => {
    execFile('node', [cli, ...args], (error, stdout, stderr) => {
      const code =
        error === null ? 0 : typeof error.code === 'number' ? error.code : 1
      res({ stdout, stderr, code })
    })
  })

describe('spm cli', () => {
  it('shows help with banner', async () => {
    const { stdout, code } = await run('--help')
    expect(code).toBe(0)
    expect(stdout).toContain('AI Skill Package Manager')
  })

  it('shows version', async () => {
    const { stdout, code } = await run('--version')
    expect(code).toBe(0)
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('registers all commands', async () => {
    const { stdout } = await run('--help')
    expect(stdout).toContain('install')
    expect(stdout).toContain('list')
    expect(stdout).toContain('doctor')
  })

  it('runs list stub', async () => {
    const { stdout } = await run('list')
    expect(stdout.trim()).toBe('Not implemented yet')
  })

  it('runs doctor stub', async () => {
    const { stdout } = await run('doctor')
    expect(stdout.trim()).toBe('Not implemented yet')
  })

  it('runs install and starts resolving', async () => {
    const { stdout } = await run('install', 'test-skillset')
    expect(stdout).toContain('Resolving endpoint')
  })
})
