import type { GitHubSource } from '@/core/downloader'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadFromGitHub } from '@/core/downloader'

const source: GitHubSource = {
  kind: 'github',
  owner: 'supa-magic',
  repository: 'skillbox',
  path: 'claude/fsd/skills/git/SKILL.md',
  ref: 'main',
}

describe('downloadFromGitHub', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('# Git Skill\n\nSkill content here.'),
        }),
      ),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns file content from GitHub', async () => {
    const content = await downloadFromGitHub(source)
    expect(content).toBe('# Git Skill\n\nSkill content here.')
  })

  it('constructs correct raw GitHub URL', async () => {
    await downloadFromGitHub(source)
    expect(fetch).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/supa-magic/skillbox/main/claude/fsd/skills/git/SKILL.md',
    )
  })

  it('throws on HTTP error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' }),
      ),
    )

    await expect(downloadFromGitHub(source)).rejects.toThrow(
      'Failed to download from GitHub',
    )
  })
})
