import type { InstallInput } from '@/core/installer'
import type { Stepper } from '@/utils/stepper'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/core/installer/spawn-claude/spawn-claude', () => ({
  spawnClaude: vi.fn(),
}))

vi.mock('@/core/installer/shared/build-prompt', () => ({
  writeInstructionsFile: vi.fn(() => '/tmp/spm/install-dev-tools.md'),
}))

import {
  installSkillset,
  spawnClaude,
  writeInstructionsFile,
} from '@/core/installer'

const mockSpawnClaude = vi.mocked(spawnClaude)
const mockWriteInstructions = vi.mocked(writeInstructionsFile)

const defaultInput: InstallInput = {
  downloadDir: '/tmp/spm/dev-tools',
  providerDir: '.claude',
  skillsetName: 'dev-tools',
  skillsetVersion: '1.0.0',
  source: '@supa-magic/skillbox',
  configPath: '.spmrc.yml',
}

const createMockStepper = (): Stepper => ({
  start: vi.fn(),
  item: vi.fn(),
  succeed: vi.fn(),
  fail: vi.fn(),
  stop: vi.fn(),
})

describe('installSkillset', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('writes instructions file and passes path to spawnClaude', async () => {
    const stepper = createMockStepper()
    mockSpawnClaude.mockResolvedValue({
      success: true,
      output: 'done',
      files: [],
    })

    const result = await installSkillset(defaultInput, stepper)

    expect(result.success).toBe(true)
    expect(mockWriteInstructions).toHaveBeenCalledWith(defaultInput)
    expect(mockSpawnClaude).toHaveBeenCalledWith(
      '/tmp/spm/install-dev-tools.md',
      stepper,
      '.claude',
      undefined,
    )
  })

  it('propagates errors from spawnClaude', async () => {
    const stepper = createMockStepper()
    mockSpawnClaude.mockRejectedValue(new Error('Claude CLI not found'))

    await expect(installSkillset(defaultInput, stepper)).rejects.toThrow(
      'Claude CLI not found',
    )
  })
})
