import type { SkillIdentifier } from './types'
import { posix } from 'node:path'
import { fetchDefaultBranch } from './fetch-default-branch'

const detectTarget = async (
  identifier: SkillIdentifier,
): Promise<'skill' | 'package'> => {
  const basename = posix.basename(identifier.path)
  if (basename === 'install.yml') return 'package'
  if (/\.md$/i.test(basename)) return 'skill'

  const ref =
    identifier.ref ??
    (await fetchDefaultBranch(identifier.owner, identifier.repository))

  const probe = async (filename: string) => {
    const url = `https://raw.githubusercontent.com/${identifier.owner}/${identifier.repository}/${ref}/${identifier.path}/${filename}`
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok
  }

  if (await probe('install.yml')) return 'package'
  if (await probe('SKILL.md')) return 'skill'

  throw new Error(
    `No install.yml or SKILL.md found at "${identifier.path}". Expected a package with install.yml or a skill with SKILL.md.`,
  )
}

export { detectTarget }
