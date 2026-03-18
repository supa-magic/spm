import { parse } from 'yaml'

const frontmatterPattern = /^---\n([\s\S]*?)\n---/

const deriveSkillName = (content: string, fileName: string): string => {
  const match = content.match(frontmatterPattern)
  if (match) {
    const frontmatter = parse(match[1]) as { name?: string } | null
    if (frontmatter?.name) return frontmatter.name
  }
  return fileName.replace(/\.md$/i, '').toLowerCase()
}

export { deriveSkillName }
