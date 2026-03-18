import type { Stepper } from '@/utils/stepper'
import type { InstallResult, SkillInstallInput } from './types'
import { writeSkillInstructionsFile } from './build-prompt'
import { spawnClaude } from './spawn-claude'

const installSingleSkill = (
  input: SkillInstallInput,
  stepper: Stepper,
): Promise<InstallResult> =>
  spawnClaude(
    writeSkillInstructionsFile(input),
    stepper,
    input.providerDir,
    input.model,
    'Skill',
  )

export { installSingleSkill }
