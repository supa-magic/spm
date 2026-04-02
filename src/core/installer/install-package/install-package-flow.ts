import type { Stepper } from '@/utils/stepper'
import type { InstallResult } from '../types'
import { join } from 'node:path'
import {
  addConfigEntry,
  getConfigPath,
  getProjectRoot,
  readConfig,
} from '@/core/config'
import {
  fetchDefaultBranch,
  fetchManifest,
  getManifestType,
  parseIdentifier,
  resolveManifest,
} from '@/core/resolver'
import { cyan, reset } from '@/utils/ansi'
import { pruneUnchanged } from '../prune-unchanged'
import {
  cleanupBeforeInstall,
  cleanupDownloadDir,
  collectRemainingFiles,
  copyFilesToProvider,
  detectConflicts,
  downloadEntries,
  listExistingFiles,
  mergeSetupConfigs,
  parseSetup,
  printCompleted,
  printSummary,
  writeFilesToTemp,
  writePackageInstructionsFile,
  writeSetupInstructionsFile,
} from '../shared'
import { spawnClaude } from '../spawn-claude'

const toTargetPath = (entry: { path: string }, manifestDir: string): string =>
  entry.path.startsWith(`${manifestDir}/`)
    ? entry.path.slice(manifestDir.length + 1)
    : entry.path

const installPackageFlow = async (
  input: string,
  stepper: Stepper,
  startedAt: number,
) => {
  readConfig()

  stepper.start('Resolving endpoint...', 'packages')
  const parsed = parseIdentifier(input)
  const { identifier } = parsed

  const ref =
    identifier.ref ??
    (await fetchDefaultBranch(identifier.owner, identifier.repository))

  const installYmlPath = identifier.path.endsWith('install.yml')
    ? identifier.path
    : `${identifier.path}/install.yml`

  const location = {
    owner: identifier.owner,
    repository: identifier.repository,
    path: installYmlPath,
    ref,
  }

  const locationRef = `${location.owner}/${location.repository}@${location.ref}`
  stepper.succeed('Resolved', locationRef)

  stepper.start('Fetching manifest...', 'packages')
  const manifest = await fetchManifest(location)
  const packageType = getManifestType(manifest)
  stepper.succeed('Fetched manifest', `${manifest.name} v${manifest.version}`)

  const { config } = readConfig()
  const firstProvider = Object.entries(config.providers)[0]
  if (!firstProvider) {
    throw new Error(
      'No provider detected. Initialize a provider directory first (e.g., .claude/).',
    )
  }
  const [providerName, providerConfig] = firstProvider
  const providerPath = providerConfig.path

  const entries = resolveManifest(manifest, location, providerName)
  if (entries.length === 0) {
    stepper.succeed('No files to download')
    stepper.stop()
    return
  }

  const projectRoot = getProjectRoot()
  const downloadDir = join(projectRoot, '.spm', manifest.name)
  const manifestDir = location.path.replace(/\/install\.yml$/, '')

  await cleanupBeforeInstall(projectRoot, downloadDir)

  stepper.start(`Downloading ${entries.length} file(s)...`, 'packages')
  const results = await downloadEntries(entries, location, (type, path) =>
    stepper.item(`${type} ${path.split('/').pop() ?? path}`),
  )

  const setupResults = results.filter((r) => r.type === 'setup')
  const installResults = results.filter((r) => r.type !== 'setup')

  await writeFilesToTemp(
    downloadDir,
    installResults.map((r) => ({
      relativePath: toTargetPath(r, manifestDir),
      content: r.content,
    })),
  )

  const rawSetupContent =
    setupResults.length > 0 ? String(setupResults[0].content) : undefined
  const setup = rawSetupContent ? parseSetup(rawSetupContent) : undefined

  stepper.succeed(`Downloaded ${results.length} file(s)`)

  const providerFullPath = join(projectRoot, providerPath)
  const installDir = join(providerFullPath, packageType, manifest.name)

  const setupOutputDir = join(projectRoot, '.spm', '.setup-output')

  if (setup?.preInstall) {
    const model = providerName === 'claude' ? 'sonnet' : undefined
    await spawnClaude(
      writeSetupInstructionsFile({
        setupContent: setup.preInstall,
        name: manifest.name,
        packageType,
        phase: 'pre-install',
        installDir: downloadDir,
        outputDir: setupOutputDir,
      }),
      stepper,
      downloadDir,
      model,
      'Package',
      'Running setup...',
      true,
    )
  }

  const pruned = pruneUnchanged(downloadDir, installDir)

  if (pruned > 0) {
    stepper.succeed(`Skipped ${pruned} unchanged file(s)`)
  }

  const source = `https://github.com/${location.owner}/${location.repository}/blob/${location.ref}/${location.path}`

  const remainingFiles = collectRemainingFiles(downloadDir)
  const { newFiles, conflictFiles } = detectConflicts(
    remainingFiles,
    installDir,
  )

  let result: InstallResult

  if (conflictFiles.length === 0) {
    result = copyFilesToProvider(
      newFiles,
      installDir,
      providerFullPath,
      stepper,
      'Package',
    )
  } else {
    const model = providerName === 'claude' ? 'sonnet' : undefined
    const embedded = {
      downloadedFiles: remainingFiles,
      existingFiles: listExistingFiles(providerFullPath),
    }
    result = await spawnClaude(
      writePackageInstructionsFile({
        providerDir: providerFullPath,
        installDir: installDir,
        packageName: manifest.name,
        packageVersion: manifest.version,
        packageType,
        source,
        configPath: getConfigPath(),
        model,
        embedded,
      }),
      stepper,
      providerFullPath,
      model,
    )
  }

  if (setup?.postInstall) {
    const model = providerName === 'claude' ? 'sonnet' : undefined
    await spawnClaude(
      writeSetupInstructionsFile({
        setupContent: setup.postInstall,
        name: manifest.name,
        packageType,
        phase: 'post-install',
        installDir,
        outputDir: setupOutputDir,
      }),
      stepper,
      providerFullPath,
      model,
      'Package',
      'Running setup...',
      true,
    )
  }

  mergeSetupConfigs(setupOutputDir, providerFullPath, installDir)

  addConfigEntry({
    providerPath,
    kind: packageType,
    name: manifest.name,
    source,
  })

  await cleanupDownloadDir(projectRoot, downloadDir)

  stepper.stop()
  printCompleted(startedAt)

  printSummary(result.files, providerPath)

  process.stdout.write(
    `\n🪄  ${cyan}Restart your AI agent to apply the changes.${reset}\n`,
  )
}

export { installPackageFlow }
