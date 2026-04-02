import type { Stepper } from '@/utils/stepper'
import type { InstallResult } from '../types'
import { spawn } from 'node:child_process'
import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { createStreamParser } from './parse-stream'
import { createStepTracker } from './step-tracker'

const debug = (() => {
  const logPath = process.env.SPM_DEBUG
  if (!logPath) return undefined
  mkdirSync(dirname(logPath), { recursive: true })
  return (label: string, data: string) =>
    appendFileSync(logPath, `[${label}] ${data}\n`, 'utf-8')
})()

const spawnClaude = (
  instructionsFilePath: string,
  stepper: Stepper,
  providerDir: string,
  model?: string,
  entityLabel = 'Skillset',
  initialStep = 'Analyzing existing setup...',
  setup = false,
): Promise<InstallResult> =>
  new Promise((resolve, reject) => {
    const args = [
      '-p',
      setup
        ? 'Execute ALL setup steps described in the system prompt.'
        : 'Install the skill as instructed.',
      '--append-system-prompt-file',
      instructionsFilePath,
      '--verbose',
      '--output-format',
      'stream-json',
      '--permission-mode',
      'acceptEdits',
      '--allowedTools',
      'Read,Write,Edit,Bash,Glob,Grep',
      ...(model ? ['--model', model] : []),
    ]

    debug?.('spawn', `claude ${args.join(' ')}`)
    debug?.(
      'config',
      `providerDir=${providerDir} instructions=${instructionsFilePath}`,
    )

    const isWindows = process.platform === 'win32'

    const child = spawn('claude', args, {
      shell: isWindows,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    const tracker = createStepTracker(
      stepper,
      providerDir,
      entityLabel,
      initialStep,
    )

    const stream = createStreamParser((event) => {
      debug?.('event', JSON.stringify(event))
      if (event.type !== 'assistant') return
      const blocks = event.message?.content
      if (!blocks) return
      blocks.forEach((block) => tracker.processBlock(block))
    })

    stepper.start(initialStep, 'skills')

    child.stdout.on('data', (chunk: Buffer) => {
      debug?.('stdout', chunk.toString())
      stream.onChunk(chunk)
    })

    let stderrBuffer = ''
    child.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString()
      debug?.('stderr', text)
      stderrBuffer += text
    })

    child.on('error', (err) => {
      debug?.('error', err.message)
      if ('code' in err && err.code === 'ENOENT') {
        reject(
          new Error(
            'Claude CLI not found. Install it: npm i -g @anthropic-ai/claude-code',
          ),
        )
        return
      }
      reject(err)
    })

    child.on('close', (code) => {
      tracker.finalize()

      const stderr = stderrBuffer.trim()
      const writtenFiles = tracker.getWrittenFiles()
      debug?.('close', `code=${code} stderr=${stderr}`)
      debug?.('files', JSON.stringify(writtenFiles))
      debug?.('result', stream.getResultText())

      if (code !== 0 && code !== null) {
        const detail = stderr ? `\n${stderr}` : ''
        reject(new Error(`Claude CLI exited with code ${code}${detail}`))
        return
      }

      if (code === null) {
        const detail = stderr ? `\n${stderr}` : ''
        reject(
          new Error(`Claude CLI was interrupted before completing${detail}`),
        )
        return
      }

      resolve({
        success: true,
        output: stream.getResultText(),
        files: writtenFiles,
      })
    })
  })

export { spawnClaude }
