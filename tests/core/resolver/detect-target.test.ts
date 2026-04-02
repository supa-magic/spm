import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { detectTarget } from '@/core/resolver'

describe('detectTarget', () => {
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

  it('returns package when path ends with install.yml', async () => {
    const result = await detectTarget({
      owner: 'org',
      repository: 'repo',
      path: 'skills/retro-game/install.yml',
    })
    expect(result).toBe('package')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns skill when path ends with .md', async () => {
    const result = await detectTarget({
      owner: 'org',
      repository: 'repo',
      path: 'skills/git/SKILL.md',
    })
    expect(result).toBe('skill')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('probes GitHub and returns package when install.yml exists', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (typeof url === 'string' && url.endsWith('/install.yml'))
          return Promise.resolve({ ok: true })
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ default_branch: 'main' }),
        })
      }),
    )

    const result = await detectTarget({
      owner: 'org',
      repository: 'repo',
      path: 'skills/retro-game',
      ref: 'main',
    })
    expect(result).toBe('package')
  })

  it('probes GitHub and returns skill when SKILL.md exists', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string, opts?: RequestInit) => {
        if (opts?.method === 'HEAD' && typeof url === 'string') {
          if (url.endsWith('/SKILL.md')) return Promise.resolve({ ok: true })
          return Promise.resolve({ ok: false })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ default_branch: 'main' }),
        })
      }),
    )

    const result = await detectTarget({
      owner: 'org',
      repository: 'repo',
      path: 'skills/git',
      ref: 'main',
    })
    expect(result).toBe('skill')
  })

  it('throws when neither file is found', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, opts?: RequestInit) => {
        if (opts?.method === 'HEAD') return Promise.resolve({ ok: false })
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ default_branch: 'main' }),
        })
      }),
    )

    await expect(
      detectTarget({
        owner: 'org',
        repository: 'repo',
        path: 'unknown/path',
        ref: 'main',
      }),
    ).rejects.toThrow('No install.yml or SKILL.md found')
  })

  it('fetches default branch when ref is not provided', async () => {
    const fetchMock = vi.fn((url: string, opts?: RequestInit) => {
      if (opts?.method === 'HEAD' && typeof url === 'string') {
        if (url.includes('/master/') && url.endsWith('/SKILL.md'))
          return Promise.resolve({ ok: true })
        return Promise.resolve({ ok: false })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ default_branch: 'master' }),
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await detectTarget({
      owner: 'org',
      repository: 'repo',
      path: 'skills/git',
    })
    expect(result).toBe('skill')
  })
})
