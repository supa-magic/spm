import { posix } from 'node:path'

const markdownLinkPattern = /\[[^\]]*\]\(([^)]+\.md)\)/g
const inlinePathPattern = /(?:`|(?:^|\s))(\.[^\s`]*\.md)/g

const providerPrefixes = [
  '.claude/',
  '.cursor/',
  '.copilot/',
  '.aider/',
  '.codeium/',
  '.cody/',
]

const isExcluded = (ref: string): boolean => {
  const normalized = ref.replace(/^\.\//, '')
  return (
    ref.startsWith('http://') ||
    ref.startsWith('https://') ||
    ref.startsWith('/') ||
    ref.includes('..') ||
    /\{[^}]+\}/.test(ref) ||
    providerPrefixes.some((prefix) => normalized.startsWith(prefix))
  )
}

const stripCodeBlocks = (text: string): string =>
  text.replace(/^(`{3,})[^\n]*\n[\s\S]*?\n\1\s*$/gm, '')

const parseSkillRefs = (content: string, fileDir: string): string[] => {
  const refs = new Set<string>()
  const stripped = stripCodeBlocks(content)

  const collect = (pattern: RegExp) => {
    for (const match of stripped.matchAll(pattern)) {
      const ref = match[1]
      if (!isExcluded(ref)) {
        const resolved = posix.normalize(posix.join(fileDir, ref))
        refs.add(resolved)
      }
    }
  }

  collect(markdownLinkPattern)
  collect(inlinePathPattern)

  return [...refs]
}

export { parseSkillRefs }
