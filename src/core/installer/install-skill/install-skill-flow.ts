import type { Stepper } from '@/utils/stepper'
import type { InstallResult } from '../types'
import { join, posix, resolve, sep } from 'node:path'
import {
  addConfigEntry,
  getConfigPath,
  getProjectRoot,
  readConfig,
} from '@/core/config'
import { resolveSkill } from '@/core/resolver'
import { cyan, dim, reset } from '@/utils/ansi'
import { pruneUnchanged } from '../prune-unchanged'
import {
  cleanupDownloadDir,
  collectRemainingFiles,
  copyFilesToProvider,
  detectConflicts,
  listExistingFiles,
  printCompleted,
  printSummary,
  writeFilesToTemp,
  writeSkillInstructionsFile,
} from '../shared'
import { spawnClaude } from '../spawn-claude'

const installSkillFlow = async (
  identifier: { owner: string; repository: string; path: string },
  stepper: Stepper,
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

  await writeFilesToTemp(
    downloadDir,
    resolved.files.map((file) => ({
      relativePath: file.path.startsWith(`${skillDir}/`)
        ? file.path.slice(skillDir.length + 1)
        : (file.path.split('/').pop() ?? file.path),
      content: file.content,
    })),
    (relativePath) => stepper.item(relativePath),
  )

  stepper.succeed(`Downloaded ${resolved.files.length} file(s)`)

  if (resolved.unresolvedRefs.length > 0) {
    stepper.succeed(
      `Skipped ${resolved.unresolvedRefs.length} unresolved reference(s)`,
      resolved.unresolvedRefs.map((r) => r.split('/').pop()).join(', '),
    )
  }

  const providerFullPath = join(projectRoot, providerPath)
  const skillsBase = resolve(providerFullPath, 'skills')
  const skillProviderDir = join(skillsBase, resolved.name)

  if (!resolve(skillProviderDir).startsWith(`${skillsBase}${sep}`)) {
    throw new Error(`Invalid skill name: "${resolved.name}"`)
  }
  const pruned = pruneUnchanged(downloadDir, skillProviderDir)

  if (pruned > 0) {
    stepper.succeed(`Skipped ${pruned} unchanged file(s)`)
  }

  const source = `https://github.com/${resolved.location.owner}/${resolved.location.repository}/blob/${resolved.location.ref}/${resolved.location.path}`

  const remainingFiles = collectRemainingFiles(downloadDir)
  const { newFiles, conflictFiles } = detectConflicts(
    remainingFiles,
    skillProviderDir,
  )

  let result: InstallResult

  if (conflictFiles.length === 0) {
    result = copyFilesToProvider(newFiles, skillProviderDir, stepper, 'Skill')
  } else {
    const model = providerName === 'claude' ? 'sonnet' : undefined
    const embedded = {
      downloadedFiles: remainingFiles,
      existingFiles: listExistingFiles(providerFullPath),
    }
    result = await spawnClaude(
      writeSkillInstructionsFile({
        providerDir: providerFullPath,
        skillName: resolved.name,
        source,
        configPath: getConfigPath(),
        model,
        unresolvedRefs: resolved.unresolvedRefs,
        embedded,
      }),
      stepper,
      providerFullPath,
      model,
      'Skill',
    )
  }

  addConfigEntry({
    providerPath,
    kind: 'skills',
    name: resolved.name,
    source,
  })

  await cleanupDownloadDir(projectRoot, downloadDir)

  stepper.stop()
  printCompleted(startedAt)

  printSummary(result.files, providerPath)

  process.stdout.write(
    `\n🪄  ${cyan}Restart your AI agent to apply the new skills.${reset}\n`,
  )
}

export { installSkillFlow }
