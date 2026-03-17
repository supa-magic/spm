import type { Command } from 'commander'
import { CONFIG_FILE, readConfig } from '@/core/config'
import { createStepper } from '@/utils/stepper'

const registerInitCommand = (program: Command) => {
  program
    .command('init')
    .description('Initialize project configuration (.spmrc.yml)')
    .action(() => {
      const stepper = createStepper()
      const { config, created } = readConfig()
      const providers = Object.keys(config.providers)

      if (created) {
        stepper.succeed(`Created ${CONFIG_FILE}`)
      } else {
        stepper.succeed(`${CONFIG_FILE} already exists`)
      }

      providers.forEach((name) => stepper.item(name))

      if (providers.length > 0) {
        stepper.succeed(`Detected ${providers.length} provider(s)`)
      } else {
        stepper.fail('No providers detected')
      }

      stepper.stop()
    })
}

export { registerInitCommand }
