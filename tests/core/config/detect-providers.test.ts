import { mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { detectProviders, knownProviders } from '@/core/config'

const createTmpDir = () => {
  const dir = join(tmpdir(), `spm-test-${Date.now()}`)
  mkdirSync(dir, { recursive: true })
  return dir
}

describe('detectProviders', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = createTmpDir()
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  it('returns empty when no provider directories exist', () => {
    const providers = detectProviders(tmpDir)
    expect(providers).toEqual({})
  })

  it('detects claude provider', () => {
    mkdirSync(join(tmpDir, '.claude'), { recursive: true })

    const providers = detectProviders(tmpDir)
    expect(providers).toEqual({
      claude: { path: '/.claude' },
    })
  })

  it('detects cursor provider', () => {
    mkdirSync(join(tmpDir, '.cursor', 'rules'), { recursive: true })

    const providers = detectProviders(tmpDir)
    expect(providers).toEqual({
      cursor: { path: '/.cursor/rules' },
    })
  })

  it('detects multiple providers', () => {
    mkdirSync(join(tmpDir, '.claude'), { recursive: true })
    mkdirSync(join(tmpDir, '.cursor', 'rules'), { recursive: true })
    mkdirSync(join(tmpDir, '.cody'), { recursive: true })

    const providers = detectProviders(tmpDir)
    expect(Object.keys(providers)).toHaveLength(3)
    expect(providers.claude).toEqual({ path: '/.claude' })
    expect(providers.cursor).toEqual({ path: '/.cursor/rules' })
    expect(providers.cody).toEqual({ path: '/.cody' })
  })

  it('includes all expected known providers', () => {
    const expected = ['claude', 'cursor', 'copilot', 'aider', 'codeium', 'cody']
    expect(Object.keys(knownProviders)).toEqual(expected)
  })
})
