import type { Stepper } from '@/utils/stepper'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  addConfigEntry,
  getConfigPath,
  getProjectRoot,
  knownProviders,
  readConfig,
} from '@/core/config'
import {
  fetchSkillset,
  resolveIdentifier,
  resolveSkillset,
} from '@/core/resolver'
import { cyan, reset } from '@/utils/ansi'
import { pruneUnchanged } from '../prune-unchanged'
import {
  cleanupDownloadDir,
  downloadEntries,
  printCompleted,
  printSummary,
  writeFilesToTemp,
  writeInstructionsFile,
} from '../shared'
import { spawnClaude } from '../spawn-claude'

const toTargetPath = (
  entry: { type: string; path: string; skillName?: string },
  skillsetDir: string,
): string => {
  if (entry.type === 'skill' && entry.skillName) {
    const fileName = entry.path.split('/').pop() ?? entry.path
    return `skills/${entry.skillName}/${fileName}`
  }
  return entry.path.startsWith(`${skillsetDir}/`)
    ? entry.path.slice(skillsetDir.length + 1)
    : entry.path
}

const installSkillsetFlow = async (
  input: string,
  stepper: Stepper,
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
    'Fetched skillset manifest',
    `${skillset.name} v${skillset.version}`,
  )

  const providerPath = knownProviders[skillset.provider]
  if (!providerPath) {
    throw new Error(
      `Unknown provider "${skillset.provider}". Known providers: ${Object.keys(knownProviders).join(', ')}`,
    )
  }

  const entries = resolveSkillset(skillset, location)
  if (entries.length === 0) {
    stepper.succeed('No files to download')
    stepper.stop()
    return
  }

  const projectRoot = getProjectRoot()
  const downloadDir = join(projectRoot, '.spm', skillset.name)
  const skillsetDir = location.path.replace(/\/[^/]+$/, '')

  stepper.start(`Downloading ${entries.length} file(s)...`, 'packages')
  const results = await downloadEntries(entries, location, (type, path) =>
    stepper.item(`${type} ${path.split('/').pop() ?? path}`),
  )

  const setupResults = results.filter((r) => r.type === 'setup')
  const installResults = results.filter((r) => r.type !== 'setup')

  await writeFilesToTemp(
    downloadDir,
    installResults.map((r) => ({
      relativePath: toTargetPath(r, skillsetDir),
      content: r.content,
    })),
  )

  let setupFile: string | undefined
  if (setupResults.length > 0) {
    const setup = setupResults[0]
    setupFile = join(downloadDir, 'SETUP.md')
    await mkdir(join(downloadDir), { recursive: true })
    await writeFile(setupFile, setup.content, 'utf-8')
  }

  stepper.succeed(`Downloaded ${results.length} file(s)`)

  const downloadedPaths = installResults.map((r) =>
    toTargetPath(r, skillsetDir),
  )
  const providerFullPath = join(projectRoot, providerPath)
  const pruned = pruneUnchanged(downloadDir, providerFullPath)

  if (pruned > 0) {
    stepper.succeed(`Skipped ${pruned} unchanged file(s)`)
  }

  const model = skillset.provider === 'claude' ? 'haiku' : undefined
  const source = `https://github.com/${location.owner}/${location.repository}/blob/${location.ref}/${location.path}`

  const result = await spawnClaude(
    writeInstructionsFile({
      downloadDir,
      setupFile,
      providerDir: providerFullPath,
      skillsetName: skillset.name,
      skillsetVersion: skillset.version,
      source,
      configPath: getConfigPath(),
      model,
    }),
    stepper,
    providerFullPath,
    model,
  )

  addConfigEntry({
    providerPath,
    kind: 'skillsets',
    name: skillset.name,
    source,
  })

  await cleanupDownloadDir(projectRoot, downloadDir)

  stepper.stop()
  printCompleted(startedAt)

  const summaryFiles = result.files.length > 0 ? result.files : downloadedPaths
  printSummary(summaryFiles, providerPath)

  process.stdout.write(
    `\n🪄  ${cyan}Restart your AI agent to apply the new skills.${reset}\n`,
  )
}

export { installSkillsetFlow }
