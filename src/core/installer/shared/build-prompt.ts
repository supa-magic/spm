import type { EmbeddedContext, InstallInput, SkillInstallInput } from '../types'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import skillTemplate from '../install-skill/install-skill.md?raw'
import template from '../install-skillset/install.md?raw'

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
      parts.push('```')
      parts.push(f.content)
      parts.push('```')
      parts.push('')
    })
  }

  return parts.join('\n')
}

const buildInstructions = (input: InstallInput): string =>
  template
    .replace(/\{\{providerDir\}\}/g, input.providerDir)
    .replace(/\{\{skillsetName\}\}/g, input.skillsetName)
    .replace(/\{\{skillsetVersion\}\}/g, input.skillsetVersion)
    .replace('{{setupSection}}', buildSetupSection(input.setupContent))
    .replace('{{embeddedSection}}', buildEmbeddedSection(input.embedded))

const writeInstructionsFile = (input: InstallInput): string => {
  const filePath = join(tmpdir(), 'spm', `install-${input.skillsetName}.md`)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, buildInstructions(input), 'utf-8')
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
  const filePath = join(tmpdir(), 'spm', `install-skill-${input.skillName}.md`)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, buildSkillInstructions(input), 'utf-8')
  return filePath
}

const writeSetupInstructionsFile = (
  setupContent: string,
  skillsetName: string,
): string => {
  const instructions = [
    '# Skillset Setup',
    '',
    `You are running setup for the **${skillsetName}** skillset.`,
    'Follow the instructions below to configure the project environment.',
    '',
    '## Output Format',
    '',
    'CRITICAL — follow exactly:',
    '- NEVER wrap output in code blocks or backticks',
    '- NEVER write conversational text',
    '- NEVER use emojis',
    '- Output ONLY structured log lines',
    '- End with `Done` on its own line',
    '',
    'Step header: `Running setup...`',
    '',
    '## Instructions',
    '',
    setupContent,
    '',
    'Done',
  ].join('\n')

  const filePath = join(tmpdir(), 'spm', `setup-${skillsetName}.md`)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, instructions, 'utf-8')
  return filePath
}

export {
  buildEmbeddedSection,
  buildInstructions,
  buildSetupSection,
  buildSkillInstructions,
  writeInstructionsFile,
  writeSetupInstructionsFile,
  writeSkillInstructionsFile,
}
