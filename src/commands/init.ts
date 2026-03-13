import type { Command } from 'commander'
import { CONFIG_FILE, readConfig } from '@/core/config'
import { hint, info, item, success } from '@/utils/log'

const registerInitCommand = (program: Command) => {
  program
    .command('init')
    .description('Initialize project configuration (.spmrc.yml)')
    .action(() => {
      const { config, created } = readConfig()
      const providers = Object.keys(config.providers)

      if (created) {
        success(`Created ${CONFIG_FILE}`)
      } else {
        info(`${CONFIG_FILE} already exists`)
      }

      if (providers.length > 0) {
        providers.forEach((name) => item(name, config.providers[name].path))
      } else {
        hint('No providers detected')
      }
    })
}

export { registerInitCommand }
