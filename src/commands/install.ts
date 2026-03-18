import type { Command } from 'commander'
import type { GitHubSource } from '@/core/downloader'
import type { FileEntry, ResolvedLocation } from '@/core/resolver'
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, normalize, posix, resolve } from 'node:path'
import {
  getConfigPath,
  getProjectRoot,
  knownProviders,
  readConfig,
} from '@/core/config'
import { downloadFile } from '@/core/downloader'
import {
  installSingleSkill,
  installSkillset,
  pruneUnchanged,
} from '@/core/installer'
import {
  fetchSkillset,
  parseIdentifier,
  resolveIdentifier,
  resolveSkill,
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
  if (file.startsWith(`${norm}/`)) return file.slice(norm.length + 1)
  const bare = norm.replace(/^\./, '')
  if (bare && file.startsWith(`${bare}/`)) return file.slice(bare.length + 1)
  return file
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

const printCompleted = (startedAt: number) => {
  const elapsed = Math.round((Date.now() - startedAt) / 1000)
  const timeStr =
    elapsed >= 60
      ? `${Math.floor(elapsed / 60)}m${(elapsed % 60).toString().padStart(2, '0')}s`
      : `${elapsed}s`
  process.stdout.write(
    `${green}✔${reset} Installation completed ${dim}in ${timeStr}${reset}\n`,
  )
}

const installSkillsetFlow = async (
  input: string,
  stepper: ReturnType<typeof createStepper>,
  startedAt: number,
) => {
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

  const toTargetPath = (entry: FileEntry): string => {
    if (entry.type === 'skill' && entry.skillName) {
      const fileName = entry.path.split('/').pop() ?? entry.path
      return `skills/${entry.skillName}/${fileName}`
    }
    const skillsetDir = location.path.replace(/\/[^/]+$/, '')
    return entry.path.startsWith(`${skillsetDir}/`)
      ? entry.path.slice(skillsetDir.length + 1)
      : entry.path
  }

  stepper.start(`Downloading ${entries.length} file(s)...`, 'packages')
  const results = await downloadEntries(entries, location, (type, path) =>
    stepper.item(`${type} ${path.split('/').pop() ?? path}`),
  )

  const setupResults = results.filter((r) => r.type === 'setup')
  const installResults = results.filter((r) => r.type !== 'setup')

  await Promise.all(
    installResults.map(async (result) => {
      const target = toTargetPath(result)
      const filePath = safePath(downloadDir, target)
      await mkdir(dirname(filePath), { recursive: true })
      await writeFile(filePath, result.content, 'utf-8')
    }),
  )

  let setupFile: string | undefined
  if (setupResults.length > 0) {
    const setup = setupResults[0]
    setupFile = join(downloadDir, 'SETUP.md')
    await mkdir(dirname(setupFile), { recursive: true })
    await writeFile(setupFile, setup.content, 'utf-8')
  }

  stepper.succeed(`Downloaded ${results.length} file(s)`)

  const downloadedPaths = installResults.map((r) => toTargetPath(r))
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
  const spmDir = join(projectRoot, '.spm')
  const remaining = await readdir(spmDir).catch(() => [])
  if (remaining.length === 0) await rm(spmDir, { recursive: true, force: true })

  stepper.stop()
  printCompleted(startedAt)

  const summaryFiles = result.files.length > 0 ? result.files : downloadedPaths
  printSummary(summaryFiles, provider.path)

  process.stdout.write(
    `\n🪄  ${cyan}Restart your AI agent to apply the new skills.${reset}\n`,
  )
}

const installSkillFlow = async (
  identifier: { owner: string; repository: string; path: string },
  stepper: ReturnType<typeof createStepper>,
  startedAt: number,
) => {
  const { config } = readConfig()

  stepper.start('Resolving skill...', 'packages')
  const resolved = await resolveSkill(identifier)
  const locationRef = `${resolved.location.owner}/${resolved.location.repository}@${resolved.location.ref}`
  stepper.succeed('Resolved', `${resolved.name} ${dim}${locationRef}${reset}`)

  const firstProvider = Object.entries(config.providers)[0]
  if (!firstProvider) {
    throw new Error(
      'No provider detected. Initialize a provider directory first (e.g., .claude/).',
    )
  }
  const [providerName, providerConfig] = firstProvider
  const providerPath = providerConfig.path

  const projectRoot = getProjectRoot()
  const downloadDir = join(projectRoot, '.spm', resolved.name)
  const skillDir = posix.dirname(resolved.location.path)

  stepper.start(`Downloading ${resolved.files.length} file(s)...`, 'packages')

  await Promise.all(
    resolved.files.map(async (file) => {
      const relativePath = file.path.startsWith(`${skillDir}/`)
        ? file.path.slice(skillDir.length + 1)
        : (file.path.split('/').pop() ?? file.path)
      const filePath = safePath(downloadDir, relativePath)
      await mkdir(dirname(filePath), { recursive: true })
      await writeFile(filePath, file.content, 'utf-8')
      stepper.item(relativePath)
    }),
  )

  stepper.succeed(`Downloaded ${resolved.files.length} file(s)`)

  const providerFullPath = join(projectRoot, providerPath)
  const skillProviderDir = join(providerFullPath, 'skills', resolved.name)
  const pruned = pruneUnchanged(downloadDir, skillProviderDir)

  if (pruned > 0) {
    stepper.succeed(`Skipped ${pruned} unchanged file(s)`)
  }

  const model = providerName === 'claude' ? 'haiku' : undefined
  const source = `@${resolved.location.owner}/${resolved.location.repository}`

  const result = await installSingleSkill(
    {
      downloadDir,
      providerDir: providerFullPath,
      skillName: resolved.name,
      source,
      configPath: getConfigPath(),
      model,
    },
    stepper,
  )

  await rm(downloadDir, { recursive: true, force: true })
  const spmDir = join(projectRoot, '.spm')
  const remaining = await readdir(spmDir).catch(() => [])
  if (remaining.length === 0) await rm(spmDir, { recursive: true, force: true })

  stepper.stop()
  printCompleted(startedAt)

  const downloadedPaths = resolved.files.map((f) => {
    const skillDirPrefix = `${skillDir}/`
    return f.path.startsWith(skillDirPrefix)
      ? `skills/${resolved.name}/${f.path.slice(skillDirPrefix.length)}`
      : `skills/${resolved.name}/${f.path.split('/').pop() ?? f.path}`
  })
  const summaryFiles = result.files.length > 0 ? result.files : downloadedPaths
  printSummary(summaryFiles, providerPath)

  process.stdout.write(
    `\n🪄  ${cyan}Restart your AI agent to apply the new skills.${reset}\n`,
  )
}

const registerInstallCommand = (program: Command) => {
  program
    .command('install <target>')
    .alias('i')
    .description('Install a skillset or skill into the project')
    .action(async (input: string) => {
      const stepper = createStepper()
      const startedAt = Date.now()

      try {
        const parsed = parseIdentifier(input)

        if (parsed.kind === 'skill') {
          await installSkillFlow(parsed.identifier, stepper, startedAt)
        } else {
          await installSkillsetFlow(input, stepper, startedAt)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        stepper.fail(message)
        stepper.stop()
        process.exitCode = 1
      }
    })
}

export { registerInstallCommand }
