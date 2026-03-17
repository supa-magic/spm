import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { pruneUnchanged } from '@/core/installer'

const setup = () => {
  const downloadDir = mkdtempSync(join(tmpdir(), 'spm-dl-'))
  const providerDir = mkdtempSync(join(tmpdir(), 'spm-prov-'))
  return { downloadDir, providerDir }
}

describe('pruneUnchanged', () => {
  it('removes files with identical content', () => {
    const { downloadDir, providerDir } = setup()
    const content = '# Same content'

    mkdirSync(join(downloadDir, 'skills/git'), { recursive: true })
    mkdirSync(join(providerDir, 'skills/git'), { recursive: true })

    writeFileSync(join(downloadDir, 'skills/git/SKILL.md'), content)
    writeFileSync(join(providerDir, 'skills/git/SKILL.md'), content)

    const removed = pruneUnchanged(downloadDir, providerDir)

    expect(removed).toBe(1)
    expect(existsSync(join(downloadDir, 'skills/git/SKILL.md'))).toBe(false)
  })

  it('keeps files with different content', () => {
    const { downloadDir, providerDir } = setup()

    mkdirSync(join(downloadDir, 'skills/git'), { recursive: true })
    mkdirSync(join(providerDir, 'skills/git'), { recursive: true })

    writeFileSync(join(downloadDir, 'skills/git/SKILL.md'), '# New')
    writeFileSync(join(providerDir, 'skills/git/SKILL.md'), '# Old')

    const removed = pruneUnchanged(downloadDir, providerDir)

    expect(removed).toBe(0)
    expect(existsSync(join(downloadDir, 'skills/git/SKILL.md'))).toBe(true)
  })

  it('keeps files that do not exist in provider', () => {
    const { downloadDir, providerDir } = setup()

    mkdirSync(join(downloadDir, 'skills/new'), { recursive: true })
    writeFileSync(join(downloadDir, 'skills/new/SKILL.md'), '# New skill')

    const removed = pruneUnchanged(downloadDir, providerDir)

    expect(removed).toBe(0)
    expect(existsSync(join(downloadDir, 'skills/new/SKILL.md'))).toBe(true)
  })

  it('handles mixed files correctly', () => {
    const { downloadDir, providerDir } = setup()

    mkdirSync(join(downloadDir, 'skills/git'), { recursive: true })
    mkdirSync(join(downloadDir, 'rules'), { recursive: true })
    mkdirSync(join(providerDir, 'skills/git'), { recursive: true })

    writeFileSync(join(downloadDir, 'skills/git/SKILL.md'), '# Same')
    writeFileSync(join(providerDir, 'skills/git/SKILL.md'), '# Same')
    writeFileSync(join(downloadDir, 'rules/coding.md'), '# New rule')

    const removed = pruneUnchanged(downloadDir, providerDir)

    expect(removed).toBe(1)
    expect(existsSync(join(downloadDir, 'skills/git/SKILL.md'))).toBe(false)
    expect(existsSync(join(downloadDir, 'rules/coding.md'))).toBe(true)
  })
})
