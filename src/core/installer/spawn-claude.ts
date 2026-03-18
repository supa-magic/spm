import type { FunCategory, Stepper } from '@/utils/stepper'
import type { InstallResult } from './types'
import { spawn } from 'node:child_process'

type ContentBlock = {
  type: string
  text?: string
  name?: string
  input?: Record<string, unknown>
}

type StreamEvent = {
  type: string
  result?: string
  message?: {
    content?: ContentBlock[]
  }
}

const isNoise = (line: string): boolean =>
  line === '```' ||
  line.startsWith('```') ||
  /^(now |let me |the files? |i'll |i will |looking |checking )/i.test(line)

const isStepHeader = (raw: string, trimmed: string): boolean =>
  !raw.startsWith(' ') && !raw.startsWith('\t') && trimmed.endsWith('...')

const stepCategory = (header: string): FunCategory => {
  if (
    header.startsWith('Integrating') ||
    header.startsWith('Analyzing') ||
    header.startsWith('Detecting')
  )
    return 'skills'
  return 'generic'
}

const irregulars: Record<string, string> = {
  Running: 'Ran',
}

const toSuccessText = (header: string): string => {
  const text = header.replace(/\.{3}$/, '').trim()
  const firstWord = text.split(' ')[0]
  if (irregulars[firstWord]) {
    return text.replace(firstWord, irregulars[firstWord])
  }
  return text.replace(/^(\w+)ing\b/, '$1ed')
}

const toRelativePath = (filePath: string, providerDir: string): string => {
  const normalized = filePath.replace(/\\/g, '/')
  const base = providerDir.replace(/\\/g, '/')
  const marker = `${base}/`
  const idx = normalized.lastIndexOf(marker)
  if (idx !== -1) return normalized.slice(idx + marker.length)
  return normalized.split('/').pop() ?? normalized
}

const spawnClaude = (
  instructionsFilePath: string,
  stepper: Stepper,
  providerDir: string,
  model?: string,
  entityLabel = 'Skillset',
): Promise<InstallResult> =>
  new Promise((resolve, reject) => {
    const args = [
      '-p',
      'Install the skill as instructed.',
      '--append-system-prompt-file',
      instructionsFilePath,
      '--verbose',
      '--output-format',
      'stream-json',
      '--allowedTools',
      'Read,Write,Edit,Bash,Glob,Grep',
      ...(model ? ['--model', model] : []),
    ]

    const isWindows = process.platform === 'win32'

    const child = spawn('claude', args, {
      shell: isWindows,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let resultText = ''
    let lineBuffer = ''
    let currentStepHeader = 'Analyzing existing setup...'
    let stepItems: string[] = []
    let stepFileCount = 0
    const state = { doneReceived: false, setupReached: false }
    const writtenFiles: string[] = []

    const succeedCurrentStep = () => {
      if (!currentStepHeader) return

      const base = toSuccessText(currentStepHeader)

      if (currentStepHeader.startsWith('Detecting')) {
        const noConflicts = stepItems.some((i) => /no conflict/i.test(i))
        stepper.succeed(noConflicts ? 'No conflicts' : base)
        return
      }

      if (currentStepHeader.startsWith('Integrating')) {
        stepper.succeed(
          stepFileCount > 0
            ? `${entityLabel} was integrated (${stepFileCount} file(s))`
            : `${entityLabel} was integrated`,
        )
        return
      }

      if (currentStepHeader.startsWith('Running setup')) {
        stepper.succeed(`${entityLabel} setup completed`)
        currentStepHeader = ''
        return
      }

      if (state.setupReached || currentStepHeader.startsWith('Cleaning')) return

      const context = stepItems.length > 0 ? stepItems.join(', ') : undefined
      stepper.succeed(base, context)
    }

    stepper.start('Analyzing existing setup...', 'skills')

    child.stdout.on('data', (chunk: Buffer) => {
      lineBuffer += chunk.toString()

      const lines = lineBuffer.split('\n')
      lineBuffer = lines.pop() ?? ''

      lines.filter(Boolean).forEach((line) => {
        try {
          const event: StreamEvent = JSON.parse(line)

          if (event.type === 'result' && event.result) {
            resultText = event.result
            return
          }

          if (event.type !== 'assistant') return
          const blocks = event.message?.content
          if (!blocks) return

          blocks.forEach((block) => {
            if (block.type === 'text' && block.text) {
              block.text.split('\n').forEach((ln: string) => {
                const trimmed = ln.trim()
                if (!trimmed || isNoise(trimmed)) return

                if (trimmed === 'Done') {
                  succeedCurrentStep()
                  currentStepHeader = ''
                  state.doneReceived = true
                  return
                }

                if (isStepHeader(ln, trimmed)) {
                  if (trimmed === currentStepHeader) return
                  succeedCurrentStep()
                  if (state.setupReached || trimmed.startsWith('Cleaning'))
                    return
                  currentStepHeader = trimmed
                  stepItems = []
                  stepFileCount = 0
                  if (trimmed.startsWith('Running setup')) {
                    state.setupReached = true
                  }
                  stepper.start(trimmed, stepCategory(trimmed))
                } else {
                  stepItems.push(trimmed)
                  if (currentStepHeader.startsWith('Integrating')) {
                    stepper.item(trimmed)
                  }
                }
              })
            }

            if (
              block.type === 'tool_use' &&
              (block.name === 'Write' || block.name === 'Edit')
            ) {
              const filePath = block.input?.file_path
              if (typeof filePath === 'string') {
                const normalized = filePath.replace(/\\/g, '/')
                const base = providerDir.replace(/\\/g, '/')
                const isProviderFile = normalized.includes(`${base}/`)
                const relative = toRelativePath(filePath, providerDir)
                if (isProviderFile) writtenFiles.push(relative)
                stepFileCount++
                if (currentStepHeader.startsWith('Integrating')) {
                  stepper.item(relative)
                }
              }
            }
          })
        } catch {
          // partial JSON, ignore
        }
      })
    })

    let stderrBuffer = ''
    child.stderr.on('data', (chunk: Buffer) => {
      stderrBuffer += chunk.toString()
    })

    child.on('error', (err) => {
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
      if (currentStepHeader) {
        succeedCurrentStep()
      }

      const completed = state.doneReceived || resultText.length > 0

      const stderr = stderrBuffer.trim()

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
        output: resultText,
        files: writtenFiles,
      })
    })
  })

export { spawnClaude }
