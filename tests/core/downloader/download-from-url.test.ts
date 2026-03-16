import type { UrlSource } from '@/core/downloader'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadFromUrl } from '@/core/downloader'

const source: UrlSource = {
  kind: 'url',
  url: 'https://example.com/skills/logging.md',
}

describe('downloadFromUrl', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('# Logging Skill'),
        }),
      ),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns file content from URL', async () => {
    const content = await downloadFromUrl(source)
    expect(content).toBe('# Logging Skill')
  })

  it('fetches from the provided URL', async () => {
    await downloadFromUrl(source)
    expect(fetch).toHaveBeenCalledWith('https://example.com/skills/logging.md')
  })

  it('throws on HTTP error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        }),
      ),
    )

    await expect(downloadFromUrl(source)).rejects.toThrow(
      'Failed to download from URL',
    )
  })
})
