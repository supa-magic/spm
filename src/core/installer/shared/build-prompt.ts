import type { InstallInput, SkillInstallInput } from '../types'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import skillTemplate from '../install-skill/install-skill.md?raw'
import template from '../install-skillset/install.md?raw'

const buildSetupSection = (setupFile?: string): string =>
  setupFile
    ? [
        '## Step 6: Running setup',
        '',
        `Read the setup file at \`${setupFile}\` and follow its instructions.`,
        'Setup files configure the project environment (e.g. MCP servers, LSP, tooling).',
        'Do NOT copy the setup file into the provider directory — only execute its instructions.',
      ].join('\n')
    : ''

const buildInstructions = (input: InstallInput): string =>
  template
    .replace(/\{\{downloadDir\}\}/g, input.downloadDir)
    .replace(/\{\{providerDir\}\}/g, input.providerDir)
    .replace(/\{\{skillsetName\}\}/g, input.skillsetName)
    .replace(/\{\{skillsetVersion\}\}/g, input.skillsetVersion)
    .replace('{{setupSection}}', buildSetupSection(input.setupFile))

const writeInstructionsFile = (input: InstallInput): string => {
  const filePath = join(tmpdir(), 'spm', `install-${input.skillsetName}.md`)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, buildInstructions(input), 'utf-8')
  return filePath
}

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

const buildSkillInstructions = (input: SkillInstallInput): string =>
  skillTemplate
    .replace(/\{\{downloadDir\}\}/g, input.downloadDir)
    .replace(/\{\{providerDir\}\}/g, input.providerDir)
    .replace(/\{\{skillName\}\}/g, input.skillName)
    .replace(
      '{{unresolvedSection}}',
      buildUnresolvedSection(input.unresolvedRefs),
    )

const writeSkillInstructionsFile = (input: SkillInstallInput): string => {
  const filePath = join(tmpdir(), 'spm', `install-skill-${input.skillName}.md`)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, buildSkillInstructions(input), 'utf-8')
  return filePath
}

export {
  buildInstructions,
  buildSetupSection,
  buildSkillInstructions,
  writeInstructionsFile,
  writeSkillInstructionsFile,
}
