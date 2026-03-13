import type { Command } from 'commander'
import { readConfig } from '@/core/config'

const registerInstallCommand = (program: Command) => {
  program
    .command('install <skillset>')
    .alias('i')
    .description('Install a skillset into the project')
    .action((skillset: string) => {
      readConfig()
      console.log(`install ${skillset}: not implemented yet`)
    })
}

export { registerInstallCommand }
