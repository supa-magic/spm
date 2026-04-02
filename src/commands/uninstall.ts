import type { Command } from 'commander'
import type { ProjectConfig } from '@/core/config'
import { readdir, rm } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import { getProjectRoot, readConfig, removeConfigEntry } from '@/core/config'
import { unmergeSetupConfigs } from '@/core/installer/shared/merge-setup-configs'
import { cyan, dim, green, reset } from '@/utils/ansi'
import { createStepper } from '@/utils/stepper'

const packageKinds = ['skills', 'hooks', 'agents', 'rules'] as const

const findPackageProvider = (config: ProjectConfig, packageName: string) => {
  for (const [, provider] of Object.entries(config.providers)) {
    for (const kind of packageKinds) {
      const entries = provider[kind]
      if (entries && Object.hasOwn(entries, packageName)) {
        return {
          providerPath: provider.path,
          kind,
          source: entries[packageName],
        }
      }
    }
  }
  return undefined
}

const registerUninstallCommand = (program: Command) => {
  program
    .command('uninstall <package>')
    .alias('un')
    .description('Uninstall a package from the project')
    .action(async (packageName: string) => {
      const stepper = createStepper()

      try {
        stepper.start('Removing package...', 'packages')

        const { config } = readConfig()
        const match = findPackageProvider(config, packageName)

        if (!match) {
          throw new Error(`Package "${packageName}" is not installed`)
        }

        const projectRoot = getProjectRoot()
        const kindDir = join(projectRoot, match.providerPath, match.kind)
        const packageDir = join(kindDir, packageName)
        const resolved = resolve(packageDir)

        if (!resolved.startsWith(`${resolve(kindDir)}${sep}`)) {
          throw new Error(`Invalid package name: "${packageName}"`)
        }

        const providerFullPath = join(projectRoot, match.providerPath)
        unmergeSetupConfigs(packageDir, providerFullPath)

        await rm(packageDir, { recursive: true, force: true })

        const remaining = await readdir(kindDir).catch(() => [])

        if (remaining.length === 0) {
          await rm(kindDir, { recursive: true, force: true })
        }

        removeConfigEntry({
          providerPath: match.providerPath,
          kind: match.kind,
          name: packageName,
        })

        stepper.succeed(
          `${green}Removed${reset}`,
          `${packageName} ${dim}from ${match.providerPath}/${match.kind}${reset}`,
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
