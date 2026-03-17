import type { InstallInput } from './types'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import template from './install.md?raw'

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
  writeFileSync(filePath, buildInstructions(input), 'utf-8')
  return filePath
}

export { buildInstructions, writeInstructionsFile }
