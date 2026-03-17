import type { Command } from 'commander'
import type { GitHubSource } from '@/core/downloader'
import type { FileEntry, ResolvedLocation } from '@/core/resolver'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, normalize, resolve } from 'node:path'
import { getConfigPath, getProjectRoot, readConfig } from '@/core/config'
import { downloadFile } from '@/core/downloader'
import { installSkillset, pruneUnchanged } from '@/core/installer'
import {
  fetchSkillset,
  resolveIdentifier,
  resolveSkillset,
} from '@/core/resolver'
import { dim, green, reset } from '@/utils/ansi'
import { createStepper } from '@/utils/stepper'

const toGitHubSource = (entry: FileEntry, ref: string): GitHubSource => ({
  kind: 'github',
  owner: entry.owner,
  repository: entry.repository,
  path: entry.path,
  ref,
})

const downloadEntries = async (
  entries: FileEntry[],
  location: ResolvedLocation,
  onFile: (type: string, path: string) => void,
) => {
  const results = await Promise.all(
    entries.map((entry) => {
      const source = toGitHubSource(entry, location.ref)
      return downloadFile(source).then((result) => {
        onFile(entry.type, entry.path)
        return {
          ...result,
          type: entry.type,
          path: entry.path,
          skillName: entry.skillName,
        }
      })
    }),
  )
  return results
}

const safePath = (baseDir: string, filePath: string): string => {
  const resolved = resolve(baseDir, normalize(filePath))

  if (!resolved.startsWith(baseDir)) {
    throw new Error(`Path traversal detected: "${filePath}"`)
  }

  return resolved
}

type TreeNode = {
  name: string
  children: TreeNode[]
}

const buildFileTree = (paths: string[]): TreeNode => {
  const root: TreeNode = { name: '', children: [] }
  paths.forEach((p) => {
    const parts = p.split('/')
    let current = root
    parts.forEach((part) => {
      const existing = current.children.find((c) => c.name === part)
      if (existing) {
        current = existing
      } else {
        const node: TreeNode = { name: part, children: [] }
        current.children.push(node)
        current = node
      }
    })
  })
  return root
}

const renderTree = (node: TreeNode, prefix = ''): string[] =>
  node.children.flatMap((child, i) => {
    const isLast = i === node.children.length - 1
    const connector = isLast ? '└─' : '├─'
    const childPrefix = prefix + (isLast ? '   ' : '│  ')
    const isDir = child.children.length > 0
    const name = isDir ? `${child.name}/` : child.name
    return [`${prefix}${connector} ${name}`, ...renderTree(child, childPrefix)]
  })

const printSummary = (files: string[]) => {
  if (files.length === 0) return
  const unique = [...new Set(files)]
  const tree = buildFileTree(unique)
  process.stdout.write(`\n📂 Installed files:\n`)
  renderTree(tree).forEach((line) => {
    process.stdout.write(`  ${dim}${line}${reset}\n`)
  })
}

const registerInstallCommand = (program: Command) => {
  program
    .command('install <skillset>')
    .alias('i')
    .description('Install a skillset into the project')
    .action(async (input: string) => {
      const stepper = createStepper()
      const startedAt = Date.now()

      try {
        const { config } = readConfig()

        stepper.start('Resolving endpoint...', 'packages')
        const location = await resolveIdentifier(input)
        const locationRef = `${location.owner}/${location.repository}@${location.ref}`
        stepper.succeed('Resolved', locationRef)

        stepper.start('Fetching skillset manifest...', 'packages')
        const skillset = await fetchSkillset(location)
        stepper.succeed(
          `Fetched skillset manifest`,
          `${skillset.name} v${skillset.version}`,
        )

        const providerEntry = Object.entries(config.providers).find(
          ([name]) => name === skillset.provider,
        )

        if (!providerEntry) {
          throw new Error(
            `Provider "${skillset.provider}" not found in config. Run "spm init" to detect providers.`,
          )
        }

        const [, provider] = providerEntry

        const entries = resolveSkillset(skillset, location)
        if (entries.length === 0) {
          stepper.succeed('No files to download')
          stepper.stop()
          return
        }

        const projectRoot = getProjectRoot()
        const downloadDir = join(projectRoot, '.spm', skillset.name)

        stepper.start(`Downloading ${entries.length} file(s)...`, 'packages')
        const results = await downloadEntries(entries, location, (type, path) =>
          stepper.item(`${type} ${path}`),
        )

        const setupResults = results.filter((r) => r.type === 'setup')
        const installResults = results.filter((r) => r.type !== 'setup')

        await Promise.all(
          installResults.map(async (result) => {
            const filePath = safePath(downloadDir, result.path)
            await mkdir(dirname(filePath), { recursive: true })
            await writeFile(filePath, result.content, 'utf-8')
          }),
        )

        let setupFile: string | undefined
        if (setupResults.length > 0) {
          const setup = setupResults[0]
          setupFile = join(downloadDir, setup.path)
          await mkdir(dirname(setupFile), { recursive: true })
          await writeFile(setupFile, setup.content, 'utf-8')
        }

        stepper.succeed(`Downloaded ${results.length} file(s)`)

        const skillsetDir = location.path.replace(/\/[^/]+$/, '')
        const downloadedPaths = installResults.map((r) =>
          r.path.startsWith(`${skillsetDir}/`)
            ? r.path.slice(skillsetDir.length + 1)
            : r.path,
        )
        const providerFullPath = join(projectRoot, provider.path)
        const pruned = pruneUnchanged(downloadDir, providerFullPath)

        if (pruned > 0) {
          stepper.succeed(`Skipped ${pruned} unchanged file(s)`)
        }

        const result = await installSkillset(
          {
            downloadDir,
            setupFile,
            providerDir: provider.path,
            skillsetName: skillset.name,
            skillsetVersion: skillset.version,
            source: `@${location.owner}/${location.repository}`,
            configPath: getConfigPath(),
          },
          stepper,
        )

        stepper.stop()

        const elapsed = Math.round((Date.now() - startedAt) / 1000)
        const timeStr =
          elapsed >= 60
            ? `${Math.floor(elapsed / 60)}m${(elapsed % 60).toString().padStart(2, '0')}s`
            : `${elapsed}s`
        process.stdout.write(
          `${green}✔${reset} Installation completed ${dim}in ${timeStr}${reset}\n`,
        )

        const summaryFiles =
          result.files.length > 0 ? result.files : downloadedPaths
        printSummary(summaryFiles)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        stepper.fail(message)
        stepper.stop()
        process.exitCode = 1
      }
    })
}

export { registerInstallCommand }
