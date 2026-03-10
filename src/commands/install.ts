import type { Command } from 'commander'

const registerInstallCommand = (program: Command) => {
  program
    .command('install <skillset>')
    .alias('i')
    .description('Install a skillset into the project')
    .action((skillset: string) => {
      console.log(`install ${skillset}: Not implemented yet`)
    })
}

export { registerInstallCommand }
