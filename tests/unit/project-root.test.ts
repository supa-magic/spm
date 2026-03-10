import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { detectProjectRoot } from '@/core/config/project-root'

const createTmpDir = () => {
  const dir = join(
    tmpdir(),
    `spm-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  )
  mkdirSync(dir, { recursive: true })
  return dir
}

describe('detectProjectRoot', () => {
  it('returns git root when inside a git repository', () => {
    const root = detectProjectRoot()
    const expected = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf-8',
    }).trim()
    expect(root).toBe(expected)
  })

  it('returns cwd when not inside a git repository', () => {
    let tmpDir: string | undefined
    const originalCwd = process.cwd()

    try {
      tmpDir = createTmpDir()
      process.chdir(tmpDir)
      const root = detectProjectRoot()
      expect(root).toBe(tmpDir)
    } finally {
      process.chdir(originalCwd)
      if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
    }
  })
})
