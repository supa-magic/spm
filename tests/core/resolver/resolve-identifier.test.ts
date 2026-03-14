import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveIdentifier } from '@/core/resolver'

describe('resolveIdentifier', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ default_branch: 'main' }),
        }),
      ),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('resolves to correct skillset path', async () => {
    expect(await resolveIdentifier('@supa-magic/skillbox/claude/fsd')).toEqual({
      owner: 'supa-magic',
      repository: 'skillbox',
      path: 'claude/fsd/skillset.yml',
      ref: 'main',
    })
  })

  it('resolves single path segment', async () => {
    expect(await resolveIdentifier('@supa-magic/skillset/nextjs')).toEqual({
      owner: 'supa-magic',
      repository: 'skillset',
      path: 'nextjs/skillset.yml',
      ref: 'main',
    })
  })

  it('resolves deep path', async () => {
    expect(await resolveIdentifier('@org/repo/a/b/c')).toEqual({
      owner: 'org',
      repository: 'repo',
      path: 'a/b/c/skillset.yml',
      ref: 'main',
    })
  })

  it('uses detected default branch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ default_branch: 'master' }),
        }),
      ),
    )

    const result = await resolveIdentifier('@org/repo/path')
    expect(result.ref).toBe('master')
  })

  it('falls back to main when API fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: false })),
    )

    const result = await resolveIdentifier('@org/repo/path')
    expect(result.ref).toBe('main')
  })

  it('throws on invalid identifier', async () => {
    await expect(resolveIdentifier('bad-input')).rejects.toThrow(
      'Must start with @',
    )
  })
})
