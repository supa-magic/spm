import type { SkillIdentifier } from './types'
import { fetchDefaultBranch } from './fetch-default-branch'

const detectTarget = async (
  identifier: SkillIdentifier,
): Promise<'skill' | 'skillset'> => {
  const ref =
    identifier.ref ??
    (await fetchDefaultBranch(identifier.owner, identifier.repository))

  const probe = async (filename: string) => {
    const url = `https://raw.githubusercontent.com/${identifier.owner}/${identifier.repository}/${ref}/${identifier.path}/${filename}`
    const res = await fetch(url, { method: 'HEAD' })
    return res.ok
  }

  if (await probe('skillset.yml')) return 'skillset'
  if (await probe('SKILL.md')) return 'skill'

  throw new Error(
    `No skillset.yml or SKILL.md found at "${identifier.path}". Expected a skill folder with SKILL.md or a skillset with skillset.yml.`,
  )
}

export { detectTarget }
