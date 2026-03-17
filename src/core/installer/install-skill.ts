import type { Stepper } from '@/utils/stepper'
import type { InstallInput, InstallResult } from './types'
import { writeInstructionsFile } from './build-prompt'
import { spawnClaude } from './spawn-claude'

const installSkillset = (
  input: InstallInput,
  stepper: Stepper,
): Promise<InstallResult> =>
  spawnClaude(writeInstructionsFile(input), stepper, input.providerDir)

export { installSkillset }
