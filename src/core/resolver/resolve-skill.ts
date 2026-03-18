import type { ResolvedSkill, SkillIdentifier } from './types'
import { posix } from 'node:path'
import { downloadFromGitHub } from '@/core/downloader'
import { deriveSkillName } from './derive-skill-name'
import { fetchDefaultBranch } from './fetch-default-branch'
import { parseSkillRefs } from './parse-skill-refs'

const resolveSkill = async (
  identifier: SkillIdentifier,
): Promise<ResolvedSkill> => {
  const ref = await fetchDefaultBranch(identifier.owner, identifier.repository)

  const visited = new Set<string>()
  const files: Array<{ path: string; content: string }> = []

  const fetchRecursive = async (repoPath: string): Promise<void> => {
    const normalized = posix.normalize(repoPath)
    if (visited.has(normalized)) return
    visited.add(normalized)

    const content = await downloadFromGitHub({
      kind: 'github',
      owner: identifier.owner,
      repository: identifier.repository,
      path: normalized,
      ref,
    })

    files.push({ path: normalized, content })

    const fileDir = posix.dirname(normalized)
    const refs = parseSkillRefs(content, fileDir)

    await Promise.all(refs.map((refPath) => fetchRecursive(refPath)))
  }

  await fetchRecursive(identifier.path)

  const mainFile = files[0]
  const fileName = posix.basename(identifier.path)
  const name = mainFile
    ? deriveSkillName(mainFile.content, fileName)
    : fileName.replace(/\.md$/i, '')

  return {
    name,
    location: {
      owner: identifier.owner,
      repository: identifier.repository,
      path: identifier.path,
      ref,
    },
    files,
  }
}

export { resolveSkill }
