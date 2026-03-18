import type { InstallInput, SkillInstallInput } from './types'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import template from './install.md?raw'
import skillTemplate from './install-skill.md?raw'

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
    .replace(/\{\{source\}\}/g, input.source)
    .replace(/\{\{configPath\}\}/g, input.configPath)
    .replace('{{setupSection}}', buildSetupSection(input.setupFile))

const writeInstructionsFile = (input: InstallInput): string => {
  const filePath = join(tmpdir(), 'spm', `install-${input.skillsetName}.md`)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, buildInstructions(input), 'utf-8')
  return filePath
}

const buildSkillInstructions = (input: SkillInstallInput): string =>
  skillTemplate
    .replace(/\{\{downloadDir\}\}/g, input.downloadDir)
    .replace(/\{\{providerDir\}\}/g, input.providerDir)
    .replace(/\{\{skillName\}\}/g, input.skillName)
    .replace(/\{\{source\}\}/g, input.source)
    .replace(/\{\{configPath\}\}/g, input.configPath)

const writeSkillInstructionsFile = (input: SkillInstallInput): string => {
  const filePath = join(tmpdir(), 'spm', `install-skill-${input.skillName}.md`)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, buildSkillInstructions(input), 'utf-8')
  return filePath
}

export {
  buildInstructions,
  buildSkillInstructions,
  writeInstructionsFile,
  writeSkillInstructionsFile,
}
