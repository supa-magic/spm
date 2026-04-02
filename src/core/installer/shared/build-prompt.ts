import type {
  EmbeddedContext,
  PackageInstallInput,
  SkillInstallInput,
} from '../types'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import packageTemplate from '../install-package/install.md?raw'
import skillTemplate from '../install-skill/install-skill.md?raw'

const sanitizeName = (name: string): string =>
  name.replace(/[/\\]/g, '-').replace(/\.\./g, '_')

const buildSetupSection = (setupContent?: string): string =>
  setupContent
    ? [
        '## Step 6: Running setup',
        '',
        'Follow the setup instructions below. Setup files configure the project environment (e.g. MCP servers, LSP, tooling).',
        'Do NOT copy the setup content into the provider directory — only execute its instructions.',
        '',
        '```',
        setupContent,
        '```',
      ].join('\n')
    : ''

const buildUnresolvedSection = (refs?: string[]): string =>
  refs && refs.length > 0
    ? [
        '## Unresolved references',
        '',
        'The following files are referenced in the skill but do not exist in the source repository.',
        'They may be runtime-generated paths (e.g. template outputs, reports). Review each reference',
        'in context and decide:',
        '',
        '- **Runtime path** → keep the reference as-is, the file will be created when the skill runs',
        '- **Missing required file** → warn the user that this file could not be found',
        '',
        ...refs.map((r) => `- \`${r}\``),
      ].join('\n')
    : ''

const buildEmbeddedSection = (embedded: EmbeddedContext): string => {
  const parts: string[] = []

  parts.push('## Existing files in provider directory')
  parts.push('')
  if (embedded.existingFiles.length === 0) {
    parts.push('Provider directory is empty.')
  } else {
    embedded.existingFiles.forEach((f) => parts.push(`- ${f}`))
  }

  parts.push('')
  parts.push('## Downloaded files (to be installed)')
  parts.push('')
  if (embedded.downloadedFiles.length === 0) {
    parts.push('No files to install (all unchanged).')
  } else {
    embedded.downloadedFiles.forEach((f) => {
      parts.push(`### ${f.path}`)
      parts.push('')
      if (Buffer.isBuffer(f.content)) {
        parts.push('*(binary file)*')
      } else {
        parts.push('```')
        parts.push(f.content)
        parts.push('```')
      }
      parts.push('')
    })
  }

  return parts.join('\n')
}

const buildPackageInstructions = (input: PackageInstallInput): string =>
  packageTemplate
    .replace(/\{\{providerDir\}\}/g, input.providerDir)
    .replace(/\{\{installDir\}\}/g, input.installDir)
    .replace(/\{\{packageName\}\}/g, input.packageName)
    .replace(/\{\{packageVersion\}\}/g, input.packageVersion)
    .replace(/\{\{packageType\}\}/g, input.packageType)
    .replace('{{setupSection}}', buildSetupSection())
    .replace('{{embeddedSection}}', buildEmbeddedSection(input.embedded))

const writePackageInstructionsFile = (input: PackageInstallInput): string => {
  const filePath = join(
    tmpdir(),
    'spm',
    `install-${sanitizeName(input.packageName)}.md`,
  )
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, buildPackageInstructions(input), 'utf-8')
  return filePath
}

const buildSkillInstructions = (input: SkillInstallInput): string =>
  skillTemplate
    .replace(/\{\{providerDir\}\}/g, input.providerDir)
    .replace(/\{\{skillName\}\}/g, input.skillName)
    .replace(
      '{{unresolvedSection}}',
      buildUnresolvedSection(input.unresolvedRefs),
    )
    .replace('{{embeddedSection}}', buildEmbeddedSection(input.embedded))

const writeSkillInstructionsFile = (input: SkillInstallInput): string => {
  const filePath = join(
    tmpdir(),
    'spm',
    `install-skill-${sanitizeName(input.skillName)}.md`,
  )
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, buildSkillInstructions(input), 'utf-8')
  return filePath
}

type SetupInstructionsInput = {
  setupContent: string
  name: string
  packageType?: string
  phase?: 'pre-install' | 'post-install'
  installDir?: string
  outputDir?: string
}

const writeSetupInstructionsFile = (input: SetupInstructionsInput): string => {
  const {
    setupContent,
    name,
    packageType = 'package',
    phase,
    installDir,
    outputDir,
  } = input
  const label = packageType.charAt(0).toUpperCase() + packageType.slice(1)
  const phaseLabel =
    phase === 'pre-install'
      ? ' (pre-install)'
      : phase === 'post-install'
        ? ' (post-install)'
        : ''
  const locationContext = installDir
    ? [
        '',
        '## Installed files location',
        '',
        `The ${packageType} files were installed to: \`${installDir}\``,
        'When the setup instructions reference files by name (e.g. `commit.md`, `push.md`), resolve them relative to this directory.',
      ]
    : []
  const outputContext = outputDir
    ? [
        '',
        '## Output directory',
        '',
        `Write ALL generated config files to: \`${outputDir}\``,
        'Keep the original filename (e.g. `settings.json`) but write it inside the output directory above.',
        'Write ONLY the new content from the instructions — do NOT read or include existing config file contents.',
        'The installer will merge your output with existing configs automatically.',
      ]
    : []
  const instructions = [
    `# ${label} Setup${phaseLabel}`,
    '',
    `You are running${phaseLabel} setup for the **${name}** ${packageType}.`,
    'Follow the instructions below to configure the project environment.',
    ...locationContext,
    ...outputContext,
    '',
    '## Rules',
    '',
    '- You MUST use Edit/Write tools to modify files — do NOT skip steps',
    '- When instructions show a config file path and a code block, CREATE the file in the output directory with ONLY the new content shown',
    '- Do NOT read existing config files — the installer handles merging automatically',
    '- You are running in non-interactive mode — skip optional steps that say "ask the developer"',
    '- Apply all non-optional changes automatically',
    '- End with `Done` on its own line when finished',
    '- Keep output concise — log what you did, not what you plan to do',
    '',
    '## Instructions',
    '',
    setupContent,
  ].join('\n')

  const suffix = phase ? `-${phase}` : ''
  const filePath = join(
    tmpdir(),
    'spm',
    `setup-${sanitizeName(name)}${suffix}.md`,
  )
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, instructions, 'utf-8')
  return filePath
}

export {
  buildEmbeddedSection,
  buildPackageInstructions,
  buildSetupSection,
  buildSkillInstructions,
  writePackageInstructionsFile,
  writeSetupInstructionsFile,
  writeSkillInstructionsFile,
}
