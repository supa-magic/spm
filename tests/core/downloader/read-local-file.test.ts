import type { LocalSource } from '@/core/downloader'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { readLocalFile } from '@/core/downloader'

const tempDir = mkdtempSync(join(tmpdir(), 'spm-test-'))

describe('readLocalFile', () => {
  it('reads file content from local path', async () => {
    const filePath = join(tempDir, 'skill.md')
    writeFileSync(filePath, '# Local Skill\n\nLocal content.')
    const source: LocalSource = { kind: 'local', filePath }

    const content = await readLocalFile(source)
    expect(content).toBe('# Local Skill\n\nLocal content.')
  })

  it('returns Buffer for binary files', async () => {
    const binaryBytes = Buffer.from([0x52, 0x49, 0x46, 0x46])
    const filePath = join(tempDir, 'sound.wav')
    writeFileSync(filePath, binaryBytes)
    const source: LocalSource = { kind: 'local', filePath }

    const content = await readLocalFile(source)
    expect(Buffer.isBuffer(content)).toBe(true)
    expect(content).toEqual(binaryBytes)
  })

  it('throws when file does not exist', async () => {
    const source: LocalSource = {
      kind: 'local',
      filePath: join(tempDir, 'nonexistent.md'),
    }

    await expect(readLocalFile(source)).rejects.toThrow(
      'Failed to read local file',
    )
  })
})
