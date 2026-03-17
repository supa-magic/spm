import type { Command } from 'commander'
import type { GitHubSource } from '@/core/downloader'
import type { FileEntry, ResolvedLocation } from '@/core/resolver'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, normalize, resolve } from 'node:path'
import {
  getConfigPath,
  getProjectRoot,
  knownProviders,
  readConfig,
} from '@/core/config'
import { downloadFile } from '@/core/downloader'
import { installSkillset, pruneUnchanged } from '@/core/installer'
import {
  fetchSkillset,
  resolveIdentifier,
  resolveSkillset,
} from '@/core/resolver'
import { cyan, dim, green, reset } from '@/utils/ansi'
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

const stripProviderPrefix = (file: string, prefix: string): string => {
  const norm = prefix.replace(/\\/g, '/').replace(/^\.\//, '')
  return file.startsWith(`${norm}/`) ? file.slice(norm.length + 1) : file
}

const printSummary = (files: string[], providerPath: string) => {
  if (files.length === 0) return
  const unique = [...new Set(files)].map((f) =>
    stripProviderPrefix(f, providerPath),
  )
  const tree = buildFileTree(unique)
  process.stdout.write(`\n📂${providerPath}\n`)
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
        readConfig()

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

        const providerPath = knownProviders[skillset.provider]

        if (!providerPath) {
          throw new Error(
            `Unknown provider "${skillset.provider}". Known providers: ${Object.keys(knownProviders).join(', ')}`,
          )
        }

        const provider = { path: providerPath }

        const entries = resolveSkillset(skillset, location)
        if (entries.length === 0) {
          stepper.succeed('No files to download')
          stepper.stop()
          return
        }

        const projectRoot = getProjectRoot()
        const downloadDir = join(projectRoot, '.spm', skillset.name)
        const skillsetDir = location.path.replace(/\/[^/]+$/, '')
        const stripPrefix = (p: string) =>
          p.startsWith(`${skillsetDir}/`) ? p.slice(skillsetDir.length + 1) : p

        stepper.start(`Downloading ${entries.length} file(s)...`, 'packages')
        const results = await downloadEntries(entries, location, (type, path) =>
          stepper.item(`${type} ${stripPrefix(path)}`),
        )

        const setupResults = results.filter((r) => r.type === 'setup')
        const installResults = results.filter((r) => r.type !== 'setup')

        await Promise.all(
          installResults.map(async (result) => {
            const relative = stripPrefix(result.path)
            const filePath = safePath(downloadDir, relative)
            await mkdir(dirname(filePath), { recursive: true })
            await writeFile(filePath, result.content, 'utf-8')
          }),
        )

        let setupFile: string | undefined
        if (setupResults.length > 0) {
          const setup = setupResults[0]
          const relative = stripPrefix(setup.path)
          setupFile = join(downloadDir, relative)
          await mkdir(dirname(setupFile), { recursive: true })
          await writeFile(setupFile, setup.content, 'utf-8')
        }

        stepper.succeed(`Downloaded ${results.length} file(s)`)

        const downloadedPaths = installResults.map((r) => stripPrefix(r.path))
        const providerFullPath = join(projectRoot, provider.path)
        const pruned = pruneUnchanged(downloadDir, providerFullPath)

        if (pruned > 0) {
          stepper.succeed(`Skipped ${pruned} unchanged file(s)`)
        }

        const model = skillset.provider === 'claude' ? 'haiku' : undefined

        const result = await installSkillset(
          {
            downloadDir,
            setupFile,
            providerDir: providerFullPath,
            skillsetName: skillset.name,
            skillsetVersion: skillset.version,
            source: `@${location.owner}/${location.repository}`,
            configPath: getConfigPath(),
            model,
          },
          stepper,
        )

        await rm(downloadDir, { recursive: true, force: true })

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
        printSummary(summaryFiles, provider.path)

        process.stdout.write(
          `\n🪄  ${cyan}Restart your AI agent to apply the new skills.${reset}\n`,
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        stepper.fail(message)
        stepper.stop()
        process.exitCode = 1
      }
    })
}

export { registerInstallCommand }
