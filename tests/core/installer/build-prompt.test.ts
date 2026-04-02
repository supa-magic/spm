import type { PackageInstallInput } from '@/core/installer'
import { describe, expect, it } from 'vitest'
import { buildPackageInstructions } from '@/core/installer'

const defaultInput: PackageInstallInput = {
  providerDir: '.claude',
  installDir: '.claude/hooks/retro-game',
  packageName: 'retro-game',
  packageVersion: '1.0.0',
  packageType: 'hooks',
  source: '@supa-magic/skillbox',
  configPath: '.spm.yml',
  embedded: {
    downloadedFiles: [{ path: 'player.mjs', content: '// player code' }],
    existingFiles: [],
  },
}

describe('buildPackageInstructions', () => {
  it('embeds downloaded file contents', () => {
    const instructions = buildPackageInstructions(defaultInput)
    expect(instructions).toContain('player.mjs')
    expect(instructions).toContain('// player code')
  })

  it('includes provider directory', () => {
    const instructions = buildPackageInstructions(defaultInput)
    expect(instructions).toContain('.claude')
  })

  it('includes package name and version', () => {
    const instructions = buildPackageInstructions(defaultInput)
    expect(instructions).toContain('retro-game')
    expect(instructions).toContain('1.0.0')
  })

  it('contains integration instructions', () => {
    const instructions = buildPackageInstructions(defaultInput)
    expect(instructions).toContain('Analyzing existing setup')
    expect(instructions).toContain('Detecting conflicts')
    expect(instructions).toContain('Integrating')
  })
})
