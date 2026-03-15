#!/usr/bin/env node
import { Command } from 'commander'
import {
  registerDoctorCommand,
  registerInitCommand,
  registerInstallCommand,
  registerListCommand,
} from '@/commands'
import { banner } from '@/utils/banner'

declare const __VERSION__: string
const version = __VERSION__

const program = new Command()

const gray = '\x1b[90m'
const reset = '\x1b[0m'

program
  .name('spm')
  .description(banner(version))
  .version(version, '-v, --version')
  .configureHelp({
    formatHelp: (cmd, helper) => {
      const defaultHelp = Command.prototype.createHelp().formatHelp(cmd, helper)
      const [description, ...rest] = defaultHelp.split('\n\n')
      return [description, `${gray}${rest.join('\n\n')}${reset}`].join('\n\n')
    },
  })

registerInitCommand(program)
registerInstallCommand(program)
registerListCommand(program)
registerDoctorCommand(program)

program.parse()
