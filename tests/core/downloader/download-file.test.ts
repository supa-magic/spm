import type { DownloadSource } from '@/core/downloader'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadFile } from '@/core/downloader'

const tempDir = mkdtempSync(join(tmpdir(), 'spm-test-'))

describe('downloadFile', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('# Remote Content'),
        }),
      ),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('dispatches to GitHub handler', async () => {
    const source: DownloadSource = {
      kind: 'github',
      owner: 'org',
      repository: 'repo',
      path: 'skill.md',
      ref: 'main',
    }

    const result = await downloadFile(source)
    expect(result.content).toBe('# Remote Content')
    expect(result.source).toBe(source)
  })

  it('dispatches to URL handler', async () => {
    const source: DownloadSource = {
      kind: 'url',
      url: 'https://example.com/skill.md',
    }

    const result = await downloadFile(source)
    expect(result.content).toBe('# Remote Content')
    expect(result.source).toBe(source)
  })

  it('dispatches to local handler', async () => {
    const filePath = join(tempDir, 'local-skill.md')
    writeFileSync(filePath, '# Local Content')
    const source: DownloadSource = { kind: 'local', filePath }

    const result = await downloadFile(source)
    expect(result.content).toBe('# Local Content')
    expect(result.source).toBe(source)
  })
})
