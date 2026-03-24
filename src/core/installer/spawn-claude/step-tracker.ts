import type { Stepper } from '@/utils/stepper'
import type { ContentBlock } from './types'
import {
  isNoise,
  isStepHeader,
  stepCategory,
  toRelativePath,
  toSuccessText,
} from './text-utils'

type StepTracker = {
  processBlock: (block: ContentBlock) => void
  getWrittenFiles: () => string[]
  finalize: () => void
}

const createStepTracker = (
  stepper: Stepper,
  providerDir: string,
  entityLabel: string,
): StepTracker => {
  let currentStepHeader = 'Analyzing existing setup...'
  let stepItems: string[] = []
  let stepFileCount = 0
  const state = { setupReached: false }
  const writtenFiles = new Set<string>()

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

  const processTextLine = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed || isNoise(trimmed)) return

    if (trimmed === 'Done') {
      succeedCurrentStep()
      currentStepHeader = ''
      return
    }

    if (isStepHeader(raw, trimmed)) {
      if (trimmed === currentStepHeader) return
      succeedCurrentStep()
      if (state.setupReached || trimmed.startsWith('Cleaning')) return
      currentStepHeader = trimmed
      stepItems = []
      stepFileCount = 0
      if (trimmed.startsWith('Running setup')) {
        state.setupReached = true
      }
      stepper.start(trimmed, stepCategory(trimmed))
    } else {
      stepItems.push(trimmed)
    }
  }

  const processToolUse = (block: ContentBlock) => {
    if (block.name !== 'Write' && block.name !== 'Edit') return
    const filePath = block.input?.file_path
    if (typeof filePath !== 'string') return

    const normalized = filePath.replace(/\\/g, '/')
    const base = providerDir.replace(/\\/g, '/')
    const isProviderFile = normalized.includes(`${base}/`)
    const relative = toRelativePath(filePath, providerDir)
    if (isProviderFile && !writtenFiles.has(relative)) {
      writtenFiles.add(relative)
      stepFileCount++
      if (currentStepHeader.startsWith('Integrating')) {
        stepper.item(relative)
      }
    }
  }

  const processBlock = (block: ContentBlock) => {
    if (block.type === 'text' && block.text) {
      block.text.split('\n').forEach(processTextLine)
    }
    if (block.type === 'tool_use') {
      processToolUse(block)
    }
  }

  return {
    processBlock,
    getWrittenFiles: () => [...writtenFiles],
    finalize: () => {
      if (currentStepHeader) succeedCurrentStep()
    },
  }
}

export type { StepTracker }
export { createStepTracker }
