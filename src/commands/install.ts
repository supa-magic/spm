import type { Command } from 'commander'
import { installSkillFlow } from '@/core/installer/install-skill'
import { installSkillsetFlow } from '@/core/installer/install-skillset'
import { parseIdentifier } from '@/core/resolver'
import { createStepper } from '@/utils/stepper'

const registerInstallCommand = (program: Command) => {
  program
    .command('install <target>')
    .alias('i')
    .description('Install a skillset or skill into the project')
    .action(async (input: string) => {
      const stepper = createStepper()
      const startedAt = Date.now()

      try {
        const parsed = parseIdentifier(input)

        if (parsed.kind === 'skill') {
          await installSkillFlow(parsed.identifier, stepper, startedAt)
        } else {
          await installSkillsetFlow(input, stepper, startedAt)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        stepper.fail(message)
        stepper.stop()
        process.exitCode = 1
      }
    })
}

export { registerInstallCommand }
