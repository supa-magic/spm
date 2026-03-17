import type { InstallInput } from '@/core/installer'
import { describe, expect, it } from 'vitest'
import { buildInstructions } from '@/core/installer'

const defaultInput: InstallInput = {
  downloadDir: '/tmp/spm/dev-tools',
  providerDir: '.claude',
  skillsetName: 'dev-tools',
  skillsetVersion: '1.0.0',
  source: '@supa-magic/skillbox',
  configPath: '.spmrc.yml',
}

describe('buildInstructions', () => {
  it('includes download directory', () => {
    const instructions = buildInstructions(defaultInput)
    expect(instructions).toContain('/tmp/spm/dev-tools')
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

  it('includes source reference', () => {
    const instructions = buildInstructions(defaultInput)
    expect(instructions).toContain('@supa-magic/skillbox')
  })

  it('includes config path', () => {
    const instructions = buildInstructions(defaultInput)
    expect(instructions).toContain('.spmrc.yml')
  })

  it('contains integration instructions', () => {
    const instructions = buildInstructions(defaultInput)
    expect(instructions).toContain('Analyzing existing setup')
    expect(instructions).toContain('Detecting conflicts')
    expect(instructions).toContain('Integrating')
  })
})
