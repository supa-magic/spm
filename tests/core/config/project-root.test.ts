import { execSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { getProjectRoot } from '@/core/config'

describe('getProjectRoot', () => {
  it('returns git root when inside a git repo', () => {
    const gitRoot = execSync('git rev-parse --show-toplevel', {
      encoding: 'utf-8',
    }).trim()
    const result = getProjectRoot()
    expect(result).toBe(gitRoot)
  })
})
