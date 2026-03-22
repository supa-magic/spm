import type { Command } from 'commander'
import type { ProjectConfig } from '@/core/config'
import { readdir, rm } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import { getProjectRoot, readConfig, removeConfigEntry } from '@/core/config'
import { cyan, dim, green, reset } from '@/utils/ansi'
import { createStepper } from '@/utils/stepper'

const findSkillProvider = (config: ProjectConfig, skillName: string) => {
  const entry = Object.entries(config.providers).find(
    ([, provider]) => provider.skills?.[skillName],
  )

  if (!entry) return undefined

  const [, provider] = entry
  return {
    providerPath: provider.path,
    source: provider.skills?.[skillName] ?? '',
  }
}

const registerUninstallCommand = (program: Command) => {
  program
    .command('uninstall <skill>')
    .alias('un')
    .description('Uninstall a skill from the project')
    .action(async (skillName: string) => {
      const stepper = createStepper()

      try {
        stepper.start('Removing skill...', 'packages')

        const { config } = readConfig()
        const match = findSkillProvider(config, skillName)

        if (!match) {
          throw new Error(`Skill "${skillName}" is not installed`)
        }

        const projectRoot = getProjectRoot()
        const skillsParentDir = join(projectRoot, match.providerPath, 'skills')
        const skillDir = join(skillsParentDir, skillName)
        const resolved = resolve(skillDir)

        if (!resolved.startsWith(`${resolve(skillsParentDir)}${sep}`)) {
          throw new Error(`Invalid skill name: "${skillName}"`)
        }

        await rm(skillDir, { recursive: true, force: true })

        const remaining = await readdir(skillsParentDir).catch(() => [])

        if (remaining.length === 0) {
          await rm(skillsParentDir, { recursive: true, force: true })
        }

        removeConfigEntry({
          providerPath: match.providerPath,
          kind: 'skills',
          name: skillName,
        })

        stepper.succeed(
          `${green}Removed${reset}`,
          `${skillName} ${dim}from ${match.providerPath}${reset}`,
        )
        stepper.stop()

        process.stdout.write(
          `\n🪄  ${cyan}Restart your AI agent to apply the changes.${reset}\n`,
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        stepper.fail(message)
        stepper.stop()
        process.exitCode = 1
      }
    })
}

export { registerUninstallCommand }
