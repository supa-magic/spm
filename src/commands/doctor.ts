import type { Command } from 'commander'

const registerDoctorCommand = (program: Command) => {
  program
    .command('doctor')
    .description('Check project health and compatibility')
    .action(() => {
      console.log('Not implemented yet')
    })
}

export { registerDoctorCommand }
