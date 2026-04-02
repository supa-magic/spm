import type { ResolvedSkill, SkillIdentifier } from './types'
import { posix } from 'node:path'
import { downloadFromGitHub } from '@/core/downloader'
import { deriveSkillName } from './derive-skill-name'
import { fetchDefaultBranch } from './fetch-default-branch'
import { parseSkillRefs } from './parse-skill-refs'

const resolveSkill = async (
  identifier: SkillIdentifier,
): Promise<ResolvedSkill> => {
  const ref =
    identifier.ref ??
    (await fetchDefaultBranch(identifier.owner, identifier.repository))

  const visited = new Set<string>()
  const files: Array<{ path: string; content: string | Buffer }> = []
  const unresolvedRefs: string[] = []

  const fetchRecursive = async (
    repoPath: string,
    isRoot: boolean,
  ): Promise<void> => {
    const normalized = posix.normalize(repoPath)
    if (visited.has(normalized)) return
    visited.add(normalized)

    let content: string | Buffer
    try {
      content = await downloadFromGitHub({
        kind: 'github',
        owner: identifier.owner,
        repository: identifier.repository,
        path: normalized,
        ref,
      })
    } catch (err) {
      if (isRoot) throw err
      unresolvedRefs.push(normalized)
      return
    }

    files.push({ path: normalized, content })

    if (typeof content === 'string') {
      const fileDir = posix.dirname(normalized)
      const refs = parseSkillRefs(content, fileDir)
      await Promise.all(refs.map((refPath) => fetchRecursive(refPath, false)))
    }
  }

  await fetchRecursive(identifier.path, true)

  const mainFile = files[0]
  const fileName = posix.basename(identifier.path)
  const name =
    mainFile && typeof mainFile.content === 'string'
      ? deriveSkillName(mainFile.content, fileName)
      : fileName.replace(/\.md$/i, '')

  const skillDir = posix.dirname(identifier.path)
  const setupPath = posix.join(skillDir, 'SETUP.md')
  const setupResult = await downloadFromGitHub({
    kind: 'github',
    owner: identifier.owner,
    repository: identifier.repository,
    path: setupPath,
    ref,
  }).catch((err: Error) =>
    /\b404\b/.test(err.message) ? undefined : Promise.reject(err),
  )
  const setupContent =
    setupResult === undefined ? undefined : String(setupResult)

  const filteredFiles = files.filter(
    (f) => posix.normalize(f.path) !== posix.normalize(setupPath),
  )

  return {
    name,
    location: {
      owner: identifier.owner,
      repository: identifier.repository,
      path: identifier.path,
      ref,
    },
    files: filteredFiles,
    unresolvedRefs,
    setupContent,
  }
}

export { resolveSkill }
