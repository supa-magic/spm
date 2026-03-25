type ParsedSetup = {
  preInstall?: string
  postInstall?: string
}

const parseSetup = (content: string): ParsedSetup => {
  const hasPreHeader = /^#\s+Pre\s+Install\b/im.test(content)
  const hasPostHeader = /^#\s+Post\s+Install\b/im.test(content)

  if (!hasPreHeader && !hasPostHeader) {
    const trimmed = content.trim()
    return { postInstall: trimmed || undefined }
  }

  const preMatch = hasPreHeader
    ? content.match(
        hasPostHeader
          ? /^#\s+Pre\s+Install\b[^\n]*\n([\s\S]*?)(?=^#\s+Post\s+Install\b)/im
          : /^#\s+Pre\s+Install\b[^\n]*\n([\s\S]*)$/im,
      )
    : undefined
  const postMatch = hasPostHeader
    ? content.match(/^#\s+Post\s+Install\b[^\n]*\n([\s\S]*)$/im)
    : undefined

  return {
    preInstall: preMatch?.[1]?.trim() || undefined,
    postInstall: postMatch?.[1]?.trim() || undefined,
  }
}

export type { ParsedSetup }
export { parseSetup }
