import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('node:child_process', () => ({
  execFileSync: vi.fn(() => {
    throw new Error('not found')
  }),
}))

import { execFileSync } from 'node:child_process'
import { detectProviders, knownProviders } from '@/core/config'

const mockExecFileSync = vi.mocked(execFileSync)

const createTmpDir = () => mkdtempSync(join(tmpdir(), 'spm-test-'))

describe('detectProviders', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = createTmpDir()
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
    mockExecFileSync.mockReset()
    mockExecFileSync.mockImplementation(() => {
      throw new Error('not found')
    })
  })

  it('returns empty when no provider directories or CLIs exist', () => {
    const providers = detectProviders(tmpDir)
    expect(providers).toEqual({})
  })

  it('detects provider by directory', () => {
    mkdirSync(join(tmpDir, '.claude'), { recursive: true })

    const providers = detectProviders(tmpDir)
    expect(providers).toEqual({
      claude: { path: '.claude' },
    })
  })

  it('detects provider by CLI', () => {
    mockExecFileSync.mockImplementation((cmd) => {
      if (cmd === 'claude') return Buffer.from('1.0.0')
      throw new Error('not found')
    })

    const providers = detectProviders(tmpDir)
    expect(providers.claude).toEqual({ path: '.claude' })
  })

  it('detects cursor provider by directory only', () => {
    mkdirSync(join(tmpDir, '.cursor', 'rules'), { recursive: true })

    const providers = detectProviders(tmpDir)
    expect(providers).toEqual({
      cursor: { path: '.cursor/rules' },
    })
  })

  it('detects multiple providers', () => {
    mkdirSync(join(tmpDir, '.claude'), { recursive: true })
    mkdirSync(join(tmpDir, '.cursor', 'rules'), { recursive: true })
    mkdirSync(join(tmpDir, '.cody'), { recursive: true })

    const providers = detectProviders(tmpDir)
    expect(Object.keys(providers)).toHaveLength(3)
    expect(providers.claude).toEqual({ path: '.claude' })
    expect(providers.cursor).toEqual({ path: '.cursor/rules' })
    expect(providers.cody).toEqual({ path: '.cody' })
  })

  it('includes all expected known providers', () => {
    const expected = ['claude', 'cursor', 'copilot', 'aider', 'codeium', 'cody']
    expect(Object.keys(knownProviders)).toEqual(expected)
  })
})
