import type { StreamEvent } from './types'

type StreamHandler = {
  onChunk: (chunk: Buffer) => void
  getResultText: () => string
}

const createStreamParser = (
  onEvent: (event: StreamEvent) => void,
): StreamHandler => {
  let lineBuffer = ''
  let resultText = ''

  const onChunk = (chunk: Buffer) => {
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

        onEvent(event)
      } catch {
        // partial JSON, ignore
      }
    })
  }

  return {
    onChunk,
    getResultText: () => resultText,
  }
}

export type { StreamHandler }
export { createStreamParser }
