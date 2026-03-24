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

const providerSkillPathPattern =
  /^\.?\/?(?:claude|cursor|copilot|aider|codeium|cody)\/skills\/[^/]+\/(.+)/

const toRelativeSkillPath = (ref: string): string | undefined => {
  const normalized = ref.replace(/^\.\//, '')
  const match = providerSkillPathPattern.exec(normalized)
  return match?.[1]
}

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
      const raw = match[1]
      const skillRelative = toRelativeSkillPath(raw)
      if (skillRelative) {
        refs.add(posix.normalize(posix.join(fileDir, skillRelative)))
      } else if (!isExcluded(raw)) {
        refs.add(posix.normalize(posix.join(fileDir, raw)))
      }
    }
  }

  collect(markdownLinkPattern)
  collect(inlinePathPattern)

  return [...refs]
}

export { parseSkillRefs }
