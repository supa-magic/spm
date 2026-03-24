import type { InstallInput } from '@/core/installer'
import { describe, expect, it } from 'vitest'
import { buildInstructions } from '@/core/installer'

const defaultInput: InstallInput = {
  providerDir: '.claude',
  skillsetName: 'dev-tools',
  skillsetVersion: '1.0.0',
  source: '@supa-magic/skillbox',
  configPath: '.spmrc.yml',
  embedded: {
    downloadedFiles: [{ path: 'skills/git/SKILL.md', content: '# Git skill' }],
    existingFiles: [],
  },
}

describe('buildInstructions', () => {
  it('embeds downloaded file contents', () => {
    const instructions = buildInstructions(defaultInput)
    expect(instructions).toContain('skills/git/SKILL.md')
    expect(instructions).toContain('# Git skill')
  })

  it('includes provider directory', () => {
    const instructions = buildInstructions(defaultInput)
    expect(instructions).toContain('.claude')
  })

  it('includes skillset name and version', () => {
    const instructions = buildInstructions(defaultInput)
    expect(instructions).toContain('dev-tools')
    expect(instructions).toContain('1.0.0')
  })

  it('contains integration instructions', () => {
    const instructions = buildInstructions(defaultInput)
    expect(instructions).toContain('Analyzing existing setup')
    expect(instructions).toContain('Detecting conflicts')
    expect(instructions).toContain('Integrating')
  })
})
