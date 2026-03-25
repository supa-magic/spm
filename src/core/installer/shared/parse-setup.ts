type ParsedSetup = {
  preInstall?: string
  postInstall?: string
}

const parseSetup = (content: string): ParsedSetup => {
  const preMatch = content.match(
    /^#\s+Pre\s+Install\b[^\n]*\n([\s\S]*?)(?=^#\s+Post\s+Install\b|\s*$)/im,
  )
  const postMatch = content.match(/^#\s+Post\s+Install\b[^\n]*\n([\s\S]*?)$/im)

  const pre = preMatch?.[1]?.trim() || undefined
  const post = postMatch?.[1]?.trim() || undefined

  if (!pre && !post) {
    const trimmed = content.trim()
    return { postInstall: trimmed || undefined }
  }

  return { preInstall: pre, postInstall: post }
}

export type { ParsedSetup }
export { parseSetup }
