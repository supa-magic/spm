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

export type { ContentBlock, StreamEvent }
