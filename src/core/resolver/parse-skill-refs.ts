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
    providerPrefixes.some((prefix) => normalized.startsWith(prefix))
  )
}

const parseSkillRefs = (content: string, fileDir: string): string[] => {
  const refs = new Set<string>()

  const collect = (pattern: RegExp) => {
    for (const match of content.matchAll(pattern)) {
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
