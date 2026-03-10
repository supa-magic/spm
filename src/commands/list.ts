import type { Command } from 'commander'

const registerListCommand = (program: Command) => {
  program
    .command('list')
    .alias('ls')
    .description('List installed skillsets')
    .action(() => {
      console.log('Not implemented yet')
    })
}

export { registerListCommand }
