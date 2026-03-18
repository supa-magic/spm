import { parse } from 'yaml'

const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---/

const hasStringName = (value: unknown): value is { name: string } =>
  typeof value === 'object' &&
  value !== null &&
  'name' in value &&
  typeof (value as Record<string, unknown>).name === 'string'

const deriveSkillName = (content: string, fileName: string): string => {
  const match = content.match(frontmatterPattern)
  if (match) {
    const frontmatter: unknown = parse(match[1])
    if (hasStringName(frontmatter)) return frontmatter.name
  }
  return fileName.replace(/\.md$/i, '').toLowerCase()
}

export { deriveSkillName }
